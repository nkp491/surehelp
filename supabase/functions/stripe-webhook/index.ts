import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16"
});
const cryptoProvider = Stripe.createSubtleCryptoProvider();
serve(async (req)=>{
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("No signature", {
      status: 400
    });
  }
  try {
    const body = await req.text();
    const event = await stripe.webhooks.constructEventAsync(body, signature, Deno.env.get("STRIPE_WEBHOOK_SECRET") || "", undefined, cryptoProvider);
    // Use service role key for webhooks (bypasses RLS)
    const supabaseAdmin = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    switch(event.type){
      case "customer.subscription.created":
      case "customer.subscription.updated":
        {
          console.log(`📝 Processing event: ${event.type}`);
          const subscription = event.data.object;
          const customerId = subscription.customer;
          const userId = subscription.metadata.supabase_user_id;
          if (!userId) {
            console.error("No user ID in subscription metadata");
            break;
          }
          // Determine plan ID from the price by querying the database
          const priceId = subscription.items.data[0]?.price?.id;
          let planId = "agent_pro"; // Default fallback
          let roleToAssign = "agent_pro"; // Default fallback
          console.log(`Processing subscription ${subscription.id} for user ${userId}:`);
          console.log(`  Received Price ID: ${priceId}`);
          if (priceId) {
            // Query subscription_plans table to find matching price ID
            const { data: matchingPlans, error: plansError } = await supabaseAdmin.from("subscription_plans").select("id, role, stripe_price_id_monthly, stripe_price_id_annual").or(`stripe_price_id_monthly.eq.${priceId},stripe_price_id_annual.eq.${priceId}`);
            if (plansError) {
              console.error("Error querying subscription plans:", plansError);
            } else if (matchingPlans && matchingPlans.length > 0) {
              const plan = matchingPlans[0];
              planId = plan.id;
              roleToAssign = plan.role;
              console.log(`✅ Found plan in database: ${planId} -> role: ${roleToAssign}`);
            } else {
              console.log(`❌ No plan found for price ID: ${priceId}, using fallback: ${planId}`);
              // Log all available plans for debugging
              const { data: allPlans } = await supabaseAdmin.from("subscription_plans").select("id, stripe_price_id_monthly, stripe_price_id_annual");
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
            current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            trial_end: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null
          };
          const { error } = await supabaseAdmin.from("subscriptions").upsert(subscriptionData, {
            onConflict: "stripe_subscription_id"
          });
          if (error) {
            console.error("Error upserting subscription:", error);
            throw error;
          }
          // Update user role based on subscription
          if (subscription.status === "active" || subscription.status === "trialing") {
            // For active/trialing subscriptions, assign the role based on the plan
            const roleRanks = {
              agent_pro: 1,
              manager_pro: 2,
              manager_pro_gold: 3,
              manager_pro_platinum: 4
            };
            const { data: latestRoleData, error: latestRoleError } = await supabaseAdmin.from("user_roles").select("id, role").eq("user_id", userId).order("assigned_at", {
              ascending: false
            }).limit(1).single();
            if (latestRoleError) {
              console.error("Error fetching latest role:", latestRoleError);
              break;
            }
            const previousRole = latestRoleData?.role;
            if (!previousRole || previousRole === "agent") {
              // No previous role—new user, insert role record
              console.log(`🟢 No previous role for user ${userId}. Inserting new role ${roleToAssign}.`);
              const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
                user_id: userId,
                role: roleToAssign
              });
              if (roleError) {
                console.error("Error inserting initial role:", roleError);
              }
            } else {
              const previousRank = roleRanks[previousRole];
              const newRank = roleRanks[roleToAssign];
              if (newRank === undefined || previousRank === undefined) {
                console.log(`UnKnown Role Ranks: previousRole=${previousRole}, newRole=${roleToAssign}`);
                return;
              }
              if (newRank > previousRank) {
                // UPGRADE: INSERT new record
                console.log(`🔼 Upgrade from ${previousRole} (${previousRank}) to ${roleToAssign} (${newRank}) - inserting new record.`);
                const { error: roleError } = await supabaseAdmin.from("user_roles").insert({
                  user_id: userId,
                  role: roleToAssign
                });
                if (roleError) {
                  console.error("Error inserting new role:", roleError);
                }
              } else if (newRank < previousRank) {
                // first check if the user has an existing role record if it has directly delete it
                const { error: deleteError } = await supabaseAdmin.from("user_roles").delete().eq("user_id", userId).eq("role", previousRole);
                if (deleteError) {
                  console.error("Error deleting existing role:", deleteError);
                }
                // DOWNGRADE: UPDATE existing record
                console.log(`🔽 Downgrade from ${previousRole} - (${previousRank}) to ${roleToAssign} (${newRank}) - updating existing record.`);
                const { error: roleError } = await supabaseAdmin.from("user_roles").upsert({
                  user_id: userId,
                  role: roleToAssign
                });
                if (roleError) {
                  console.error("Error inserting downgraded role:", roleError);
                }
              } else {
                // Same rank: no action or optional update
                console.log(`⚠️ No rank change between ${previousRole} and ${roleToAssign}`);
              }
            }
          } else if (subscription.status === "canceled" || subscription.status === "past_due" || subscription.status === "incomplete_expired" || subscription.status === "unpaid") {
            // For canceled/problematic subscriptions, revert to basic agent role
            console.log(`🚫 Subscription ${subscription.status} - reverting user ${userId} to agent role`);
            const { error: roleError } = await supabaseAdmin.from("user_roles").update({
              role: "agent"
            }).eq("user_id", userId);
            if (roleError) {
              console.error("Error reverting user role:", roleError);
            } else {
              console.log(`✅ Role reverted to agent for user ${userId} due to subscription status: ${subscription.status}`);
            }
          } else {
            console.log(`⚠️ Unhandled subscription status: ${subscription.status} for user ${userId}`);
          }
          break;
        }
      case "customer.subscription.deleted":
        {
          console.log("user is going to unsubscribe from platform 🗑️");
          const subscription = event.data.object;
          const userId = subscription.metadata.supabase_user_id;
          if (!userId) {
            console.error("No user ID in subscription metadata");
            break;
          }
          console.log(`🗑️ Subscription ${subscription.id} deleted for user ${userId}`);
          // Update subscription status to canceled
          const { error: deleteError } = await supabaseAdmin.from("subscriptions").delete().eq("user_id", userId);
          // await stripe.subscriptions.update(subscription.id, {
          //   cancel_at_period_end: false
          // });
          if (deleteError) {
            console.error("Error updating subscription status:", deleteError);
          }
          // Revert user role to basic agent
          const { data: latestRole, error: selectError } = await supabaseAdmin.from("user_roles").select("id, role").eq("user_id", userId).order("assigned_at", {
            ascending: false
          }).limit(1).single();
          if (selectError) {
            console.error("Error fetching latest role:", selectError);
          } else if (latestRole?.id && latestRole?.role !== "agent") {
            // 2️⃣ Update that single row
            const { error: updateError } = await supabaseAdmin.from("user_roles").update({
              role: "agent"
            }).eq("id", latestRole.id);
            if (updateError) {
              console.error("Error updating role:", updateError);
            } else {
              console.log(`✅ Updated most recent role to 'agent' for user ${userId}`);
            }
          } else {
            console.log(`ℹ️ No roles found for user ${userId}`);
          }
          // Revert user role to basic agent
          const { error: deleteRolesError } = await supabaseAdmin.from("user_roles").delete().eq("user_id", userId).neq("role", "agent");
          if (deleteRolesError) {
            console.error("Error reverting user role:", deleteRolesError);
          } else {
            console.log(`✅ Role reverted to agent for user ${userId} after subscription deletion`);
          }
          break;
        }
      case "invoice.payment_succeeded":
        {
          const invoice = event.data.object;
          if (invoice.subscription) {
            // Payment successful, subscription is active
            console.log(`Payment succeeded for subscription: ${invoice.subscription}`);
          }
          break;
        }
      case "invoice.payment_failed":
        {
          const invoice = event.data.object;
          if (invoice.subscription) {
            // Payment failed, handle accordingly
            console.log(`Payment failed for subscription: ${invoice.subscription}`);
          }
          break;
        }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
    return new Response(JSON.stringify({
      received: true
    }), {
      headers: {
        "Content-Type": "application/json"
      },
      status: 200
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(`Webhook error: ${error.message}`, {
      status: 400
    });
  }
});
