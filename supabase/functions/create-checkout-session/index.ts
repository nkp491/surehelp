import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.18.0?target=deno";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Get the session or user object
    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    if (!user) {
      throw new Error("User not found");
    }

    const { priceId, trialDays = 14, promotionCode } = await req.json();

    if (!priceId) {
      throw new Error("Price ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Check if customer exists
    let customer;
    const { data: existingCustomer } = await supabaseClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .single();

    if (existingCustomer?.stripe_customer_id) {
      customer = await stripe.customers.retrieve(
        existingCustomer.stripe_customer_id
      );
    } else {
      // Create new customer
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id,
        },
      });
    }

    let discounts: { promotion_code: string }[] | undefined = undefined;
    let redemption = undefined;
    let trial_days: undefined;
    if (promotionCode) {
      // You may want to store the Stripe promotion_code ID in your DB, or fetch it from Stripe
      const promoList = await stripe.promotionCodes.list({ code: promotionCode, active: true });
      if (promoList.data.length > 0) {
        discounts = [{ promotion_code: promoList.data[0].id }];
        redemption = promoList.data[0].times_redeemed;  
        trial_days = promoList.data[0].coupon?.metadata?.trial_days;
      } else {
        throw new Error("Invalid or expired promotion code");
      }

      // const { data: promoCodeData } = await supabaseClient
      //   .from("promo_codes")
      //   .select("usage_limit, usage_count")
      //   .eq("promo_code", promotionCode)
      //   .single();

      // if (promoCodeData) {
      //   if (promoCodeData.usage_limit && promoCodeData.usage_count >= promoCodeData.usage_limit) {
      //     throw new Error("This promo code has reached its usage limit.");
      //   }
      // }
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url: `${req.headers.get(
        "origin"
      )}/profile?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/pricing`,
      subscription_data: {
        trial_period_days: trial_days || trialDays,
        metadata: {
          supabase_user_id: user.id,
          promotion_code: promotionCode || "",
        },
      },
      ...(trial_days ? {} : discounts ? { discounts } : {}),
    });
    // revoke promo for this user
    // const deleted = await stripe.customers.deleteDiscount(customer.id);
    console.log("Deleted discount:", discounts);
    return new Response(JSON.stringify({ sessionId: session.id,}), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
      "statusText": "Coupon applied successfully",
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
