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
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    const body = await req.json();
    const {
      code,
      discount_type,
      value,
      duration, // "once", "repeating", or "forever"
      plan,
      billing_cycle,
      expiration_date,
      usage_limit
    } = body;
     const coupon = await stripe.coupons.create({
      ...(discount_type === "percentage"
        ? { percent_off: value }
        : { amount_off: value * 100 }),
      duration: duration || "once"
    });

    // Create promotion code on Stripe
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: code,
      max_redemptions: usage_limit,
      expires_at: Math.floor(new Date(expiration_date).getTime() / 1000)
    });

    const { error } = await supabaseClient.from("promo_codes").insert([{
      code,
      plan,
      billing_cycle,
      discount_type,
      value,
      duration_type: "discount",
      duration_length: 1, // you can make this dynamic
      expiration_date,
      usage_limit,
      is_active: true
    }]);

    if (error) {
      console.error("Supabase error:", error);
      return new Response("Database error", { status: 500 });
    }
    return new Response(JSON.stringify({ promo }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
