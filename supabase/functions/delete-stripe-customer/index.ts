import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type"
};
serve(async (req)=>{
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: corsHeaders
    });
  }
  try {
    const supabaseClient = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_ANON_KEY") ?? "", {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization")
        }
      }
    });
    // Get the session or user object
    const { data: { user } } = await supabaseClient.auth.getUser();
    if (!user) {
      throw new Error("User not found");
    }
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16"
    });
    const body = await req.json();
    const { stripe_subscription_id } = body;
    if (!stripe_subscription_id) {
      throw new Error("Stripe subscription ID is required");
    }
    // Delete the customer in Stripe

    const deletedCustomer = await stripe.subscriptions.del(stripe_subscription_id);
    if (!deletedCustomer) {
      throw new Error("Failed to delete Stripe subscription");
    }
    return new Response(JSON.stringify({ success: true, message: "Stripe subscription deleted successfully" }), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    });
  } catch (error) {
    console.error("Internal Error while deleting Stripe subscription:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 500
    });
  }
});