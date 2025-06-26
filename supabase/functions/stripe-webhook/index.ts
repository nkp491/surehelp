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
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata.supabase_user_id;

        if (!userId) {
          console.error("No user ID in subscription metadata");
          break;
        }

        // Determine plan ID from the price
        const priceId = subscription.items.data[0]?.price?.id;
        let planId = "agent_pro"; // Default to agent_pro for now

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
          await supabaseAdmin.from("user_roles").upsert(
            {
              user_id: userId,
              role: "agent_pro",
            },
            {
              onConflict: "user_id",
            }
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

        // Update subscription status
        await supabaseAdmin
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("stripe_subscription_id", subscription.id);

        // Revert user role to basic agent
        await supabaseAdmin
          .from("user_roles")
          .update({ role: "agent" })
          .eq("user_id", userId);

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
