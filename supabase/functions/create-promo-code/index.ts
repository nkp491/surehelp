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
    const { promo_code, discount_type, value, duration, plan, billing_cycle, expiration_date, usage_limit, newCode, activateCode } = body;

    // logic to add new promo code
    if(newCode){
    let coupon;
    if (discount_type === "percentage") {
      coupon = await stripe.coupons.create({
        percent_off: value,
        duration: duration || "once"
      });
    } else if (discount_type === "fixed") {
      coupon = await stripe.coupons.create({
        amount_off: value * 100,
        currency: "usd",
        duration: duration || "once"
      });
    } else if (discount_type === "30-day-trial" || discount_type === "90-day-trial") {
      // Use a zero-value coupon + add metadata to mark as trial
      coupon = await stripe.coupons.create({
        percent_off: 100,
        duration: "once",
        metadata: {
          trial_days: discount_type === "30-day-trial" ? "30" : "90"
        }
      });
    } else {
      throw new Error("Invalid discount_type");
    }
    // Create promotion code on Stripe
    const promo = await stripe.promotionCodes.create({
      coupon: coupon.id,
      code: promo_code,
      max_redemptions: usage_limit,
      expires_at: Math.floor(new Date(expiration_date).getTime() / 1000)
    });
    const { error } = await supabaseClient.from("promo_codes").insert([
      {
        promo_code,
        plan,
        billing_cycle,
        discount_type,
        value,
        duration_type: "discount",
        duration_length: 1,
        expiration_date,
        usage_limit,
        status: "active",
        coupon_id: promo.id,
      }
    ]);
    if (error) {
      console.error("Supabase error:", error);
      return new Response("Database error", {
        status: 500
      });
    }
    return new Response(JSON.stringify({
      promo
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
    }

    // logic to activate or deactivate promo code
   if(activateCode){
    const { action, coupon_id } = body;
    console.log(`Action: ${action}, Coupon ID: ${coupon_id}`);
    const status = await stripe.promotionCodes.update(coupon_id, {
      active: action === "activate" ? true : false
    });
    if (!status) {
      return new Response(JSON.stringify({
        error: "Failed to update promo code status"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }

    const { data, error } = await supabaseClient
      .from("promo_codes")
      .update({ status: action === "activate" ? "active" : "inactive" })
      .eq("coupon_id", coupon_id)
      .select("*");
    if (error) {
      console.error(`Error ${action} promo code:`, error);
      return new Response(JSON.stringify({
        error: `Failed to ${action} promo code: ${error.message}`
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    return new Response(JSON.stringify({
      status
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });
   }

   // logic to delete the promo code
   if (body.deleteCode) {
    const { coupon_id } = body;
    if (!coupon_id) {
      return new Response(JSON.stringify({
        error: "Coupon ID is required to delete promo code"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    const deleted = await stripe.promotionCodes.update(coupon_id, {
      active: false
    });
    if (!deleted) {
      return new Response(JSON.stringify({
        error: "Failed to delete promo code"
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    const { data, error } = await supabaseClient
      .from("promo_codes")
      .delete()
      .eq("coupon_id", coupon_id)
      .select("*");
    if (error) {
      console.error("Error deleting promo code from Supabase:", error);
      return new Response(JSON.stringify({
        error: `Failed to delete promo code from database: ${error.message}`
      }), {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json"
        },
        status: 400
      });
    }
    return new Response(JSON.stringify({
      message: "Promo code deleted successfully",
      data
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 200
    });

   }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      },
      status: 400
    });
  }
});
