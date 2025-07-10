import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { stripePromise } from "@/integrations/stripe/client";
import { CreateCheckoutSessionParams } from "@/integrations/stripe/types";
import { useToast } from "@/hooks/use-toast";

export function useStripeCheckout() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const createCheckoutSession = async (params: CreateCheckoutSessionParams) => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Call Supabase Edge Function to create checkout session
      const { data, error } = await supabase.functions.invoke(
        "create-checkout-session",
        {
          body: {
            priceId: params.priceId,
            userId: user.id,
            trialDays: params.trialDays,
            promotionCode: params.promotionCode,
          },
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.sessionId) {
        throw new Error(
          "No session ID returned from checkout session creation"
        );
      }

      // Redirect to Stripe Checkout
      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Stripe failed to load");
      }

      const { error: stripeError } = await stripe.redirectToCheckout({
        sessionId: data.sessionId,
      });

      if (stripeError) {
        throw stripeError;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createPortalSession = async () => {
    try {
      setIsLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("User not authenticated");
      }

      // Call Supabase Edge Function to create portal session
      const { data, error } = await supabase.functions.invoke(
        "create-portal-session",
        {
          body: {
            userId: user.id,
          },
        }
      );

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error("No portal URL returned");
      }

      // Redirect to Stripe Customer Portal
      window.location.href = data.url;
    } catch (error) {
      console.error("Error creating portal session:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to open billing portal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createCheckoutSession,
    createPortalSession,
    isLoading,
  };
}
