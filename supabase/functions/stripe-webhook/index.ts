import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

const cryptoProvider = Stripe.createSubtleCryptoProvider();

serve(async (req) => {
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return new Response("No signature", { status: 400 });
  }

  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
      undefined,
      cryptoProvider
    );

    // Use service role key for webhooks (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        console.log(`📝 Processing event: ${event.type}`);
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata.supabase_user_id;

        if (!userId) {
          console.error("No user ID in subscription metadata");
          break;
        }

        // Determine plan ID from the price by querying the database
        const priceId = subscription.items.data[0]?.price?.id;
        let planId = "agent_pro"; // Default fallback
        let roleToAssign = "agent_pro"; // Default fallback

        console.log(
          `Processing subscription ${subscription.id} for user ${userId}:`
        );
        console.log(`  Received Price ID: ${priceId}`);

        if (priceId) {
          // Query subscription_plans table to find matching price ID
          const { data: matchingPlans, error: plansError } = await supabaseAdmin
            .from("subscription_plans")
            .select("id, role, stripe_price_id_monthly, stripe_price_id_annual")
            .or(
              `stripe_price_id_monthly.eq.${priceId},stripe_price_id_annual.eq.${priceId}`
            );

          if (plansError) {
            console.error("Error querying subscription plans:", plansError);
          } else if (matchingPlans && matchingPlans.length > 0) {
            const plan = matchingPlans[0];
            planId = plan.id;
            roleToAssign = plan.role;
            console.log(
              `✅ Found plan in database: ${planId} -> role: ${roleToAssign}`
            );
          } else {
            console.log(
              `❌ No plan found for price ID: ${priceId}, using fallback: ${planId}`
            );

            // Log all available plans for debugging
            const { data: allPlans } = await supabaseAdmin
              .from("subscription_plans")
              .select("id, stripe_price_id_monthly, stripe_price_id_annual");
            console.log("Available plans in database:", allPlans);
          }
        }

        console.log(`  Final Plan: ${planId}`);
        console.log(`  Final Role: ${roleToAssign}`);
        console.log(`  Status: ${subscription.status}`);

        const subscriptionData = {
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          plan_id: planId,
          status: subscription.status,
          current_period_start: new Date(
            subscription.current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            subscription.current_period_end * 1000
          ).toISOString(),
          trial_end: subscription.trial_end
            ? new Date(subscription.trial_end * 1000).toISOString()
            : null,
        };

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .upsert(subscriptionData, {
            onConflict: "stripe_subscription_id",
          });

        if (error) {
          console.error("Error upserting subscription:", error);
          throw error;
        }

        // Update user role based on subscription
        if (
          subscription.status === "active" ||
          subscription.status === "trialing"
        ) {
          // For active/trialing subscriptions, assign the role based on the plan
          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .upsert(
              {
                user_id: userId,
                role: roleToAssign,
              },
              {
                onConflict: "user_id,role",
              }
            );

          if (roleError) {
            console.error("Error updating user role:", roleError);
          } else {
            console.log(
              `✅ Role updated to ${roleToAssign} for user ${userId}`
            );
          }
        } else if (
          subscription.status === "canceled" ||
          subscription.status === "past_due" ||
          subscription.status === "incomplete_expired" ||
          subscription.status === "unpaid"
        ) {
          // For canceled/problematic subscriptions, revert to basic agent role
          console.log(
            `🚫 Subscription ${subscription.status} - reverting user ${userId} to agent role`
          );

          const { error: roleError } = await supabaseAdmin
            .from("user_roles")
            .update({ role: "agent" })
            .eq("user_id", userId);

          if (roleError) {
            console.error("Error reverting user role:", roleError);
          } else {
            console.log(
              `✅ Role reverted to agent for user ${userId} due to subscription status: ${subscription.status}`
            );
          }
        } else {
          console.log(
            `⚠️ Unhandled subscription status: ${subscription.status} for user ${userId}`
          );
        }

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.supabase_user_id;

        if (!userId) {
          console.error("No user ID in subscription metadata");
          break;
        }

        console.log(
          `🗑️ Subscription ${subscription.id} deleted for user ${userId}`
        );

        // Update subscription status to canceled
        const { error: updateError } = await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        if (updateError) {
          console.error("Error updating subscription status:", updateError);
        }

        // Revert user role to basic agent
        const { error: roleError } = await supabaseAdmin
          .from("user_roles")
          .update({ role: "agent" })
          .eq("user_id", userId);

        if (roleError) {
          console.error("Error reverting user role:", roleError);
        } else {
          console.log(
            `✅ Role reverted to agent for user ${userId} after subscription deletion`
          );
        }

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // Payment successful, subscription is active
          console.log(
            `Payment succeeded for subscription: ${invoice.subscription}`
          );
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.subscription) {
          // Payment failed, handle accordingly
          console.log(
            `Payment failed for subscription: ${invoice.subscription}`
          );
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, {
      status: 400,
    });
  }
});
