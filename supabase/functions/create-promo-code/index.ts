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
    return new Response("ok", {
      headers: corsHeaders,
    });
  }
  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: {
            Authorization: req.headers.get("Authorization"),
          },
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
      promo_code,
      discount_type,
      value,
      expiration_date,
      usage_limit,
      newCode,
      activateCode,
    } = body;
    // logic to add new promo code
    if (newCode) {
      let coupon;
      if (discount_type === "percentage") {
        coupon = await stripe.coupons.create({
          percent_off: value,
          duration: "once",
        });
      } else if (discount_type === "fixed") {
        coupon = await stripe.coupons.create({
          amount_off: value * 100,
          currency: "usd",
          duration: "once",
        });
      } else if (
        discount_type === "30-day-trial" ||
        discount_type === "90-day-trial"
      ) {
        // Use a zero-value coupon + add metadata to mark as trial
        coupon = await stripe.coupons.create({
          percent_off: 0.01,
          duration: "once",
          metadata: {
            trial_days: discount_type === "30-day-trial" ? "30" : "90",
          },
        });
      } else {
        throw new Error("Invalid discount_type");
      }
      // Create promotion code on Stripe
      const promo = await stripe.promotionCodes.create({
        coupon: coupon.id,
        code: promo_code,
        max_redemptions: usage_limit,
        // restrictions: {
        //   customer: true, // limit to one per Stripe customer
        // },
        expires_at: Math.floor(new Date(expiration_date).getTime() / 1000),
      });
      const { data: newPromo, error } = await supabaseClient
        .from("promo_codes")
        .insert([
          {
            promo_code,
            discount_type,
            value,
            expiration_date,
            usage_limit,
            status: "active",
            coupon_id: coupon.id,
            promo_id: promo.id,
          },
        ])
        .select();
      if (error) {
        console.error("Supabase error:", error);
        return new Response(
          JSON.stringify({
            error: `Failed to create promo code in database: ${error.message}`,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 400,
          }
        );
      }
      return new Response(
        JSON.stringify({
          message: "Promo code created successfully",
          promo: newPromo[0],
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }
    // logic to activate or deactivate promo code
    if (activateCode) {
      const { action, promo_id } = body;
      if (!action || !promo_id) {
        return new Response(
          JSON.stringify({
            error: "Action and promo ID are required",
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 400,
          }
        );
      }
      const status = await stripe.promotionCodes.update(promo_id, {
        active: action === "activate",
      });
      if (!status) {
        return new Response(
          JSON.stringify({
            error: "Failed to update promo code status",
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 400,
          }
        );
      }
      const { data, error } = await supabaseClient
        .from("promo_codes")
        .update({
          status: action === "activate" ? "active" : "inactive",
        })
        .eq("promo_id", promo_id)
        .select("*");
      if (error) {
        console.error(`Error ${action} promo code:`, error);
        return new Response(
          JSON.stringify({
            error: `Failed to ${action} promo code: ${error.message}`,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 400,
          }
        );
      }
      return new Response(
        JSON.stringify({
          status,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }
    // logic to delete the promo code
    if (body.deleteCode) {
      const { coupon_id, promo_id } = body;
      if (!coupon_id && !promo_id) {
        return new Response(
          JSON.stringify({
            error: "Coupon ID and promo code are required for deletion",
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 400,
          }
        );
      }
      const deletePromoCode = await stripe.promotionCodes.update(promo_id, {
        active: false,
      });
      const deleteCoupons = await stripe.coupons.del(coupon_id);
      if (!deleteCoupons || !deletePromoCode) {
        return new Response(
          JSON.stringify({
            error: "Failed to delete promo and coupon codes",
            deleteCoupons,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 400,
          }
        );
      }
      const { data, error } = await supabaseClient
        .from("promo_codes")
        .delete()
        .eq("coupon_id", coupon_id)
        .select("*");
      if (error) {
        console.error("Error deleting promo code from Supabase:", error);
        return new Response(
          JSON.stringify({
            error: `Failed to delete promo code from database: ${error.message}`,
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
            status: 400,
          }
        );
      }
      return new Response(
        JSON.stringify({
          message: "Promo code deleted successfully",
          data,
          deleteCoupons,
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
          status: 200,
        }
      );
    }
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
        status: 400,
      }
    );
  }
});
