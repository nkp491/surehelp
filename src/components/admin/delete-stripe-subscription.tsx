import { supabase } from "@/integrations/supabase/client";

export function useStripeSubscriptionDeletion() {
  const deleteStripeSubscription = async (stripeSubscriptionId: string) => {
    if (!stripeSubscriptionId) {
      console.error("No stripeSubscriptionId provided");
      return null;
    }

    try {
      const { data, error } = await supabase.functions.invoke("delete-stripe-customer", {
        body: { stripe_subscription_id: stripeSubscriptionId },
      });

      if (error) {
        throw new Error(`No Subscription found for ID: ${stripeSubscriptionId}`);
      }

      return data ?? null;
    } catch (err) {
      console.error("Error deleting Stripe subscription:", err);
      throw err;
    }
  };

  return { deleteStripeSubscription };
}

