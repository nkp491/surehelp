import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useMemo,
} from "react";
import { supabase } from "@/integrations/supabase/client";
import { Subscription, SubscriptionPlan } from "@/integrations/stripe/types";
import { useAuthState } from "@/hooks/useAuthState";

interface SubscriptionContextType {
  subscription: Subscription | null;
  subscriptionPlan: SubscriptionPlan | null;
  isLoading: boolean;
  isSubscribed: boolean;
  isTrialing: boolean;
  hasActiveSubscription: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(
  undefined
);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [subscriptionPlan, setSubscriptionPlan] =
    useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated } = useAuthState();

  const fetchSubscription = async () => {
    if (!isAuthenticated) {
      setSubscription(null);
      setSubscriptionPlan(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch active subscription
      const { data: subscriptionData, error: subscriptionError } =
        await supabase
          .from("subscriptions")
          .select(
            `
          *,
          subscription_plans (*)
        `
          )
          .eq("user_id", user.id)
          .in("status", ["active", "trialing"])
          .order("created_at", { ascending: false })
          .limit(1)
          .single();

      if (subscriptionError && subscriptionError.code !== "PGRST116") {
        console.error("Error fetching subscription:", subscriptionError);
        return;
      }

      if (subscriptionData) {
        const transformedSubscription = {
          ...subscriptionData,
          currentPeriodStart: subscriptionData.current_period_start,
          currentPeriodEnd: subscriptionData.current_period_end,
          stripeCustomerId: subscriptionData.stripe_customer_id,
          stripeSubscriptionId: subscriptionData.stripe_subscription_id,
          trialEnd: subscriptionData.trial_end,
          planId: subscriptionData.plan_id,
          userId: subscriptionData.user_id,
          createdAt: subscriptionData.created_at,
          updatedAt: subscriptionData.updated_at,
          status: subscriptionData.status as "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid"
        };
        
        const transformedPlan = {
          ...subscriptionData.subscription_plans,
          monthlyPrice: subscriptionData.subscription_plans.monthly_price,
          annualPrice: subscriptionData.subscription_plans.annual_price,
          stripePriceIdMonthly: subscriptionData.subscription_plans.stripe_price_id_monthly,
          stripePriceIdAnnual: subscriptionData.subscription_plans.stripe_price_id_annual,
          features: Array.isArray(subscriptionData.subscription_plans.features) 
            ? subscriptionData.subscription_plans.features as string[]
            : []
        };
        
        setSubscription(transformedSubscription);
        setSubscriptionPlan(transformedPlan);
      } else {
        setSubscription(null);
        setSubscriptionPlan(null);
      }
    } catch (error) {
      console.error("Error in fetchSubscription:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [isAuthenticated]);

  // Set up real-time subscription to subscription changes
  useEffect(() => {
    if (!isAuthenticated) return;

    const channel = supabase
      .channel("subscription_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "subscriptions",
          filter: `user_id=eq.${supabase.auth
            .getUser()
            .then(({ data }) => data.user?.id)}`,
        },
        () => {
          fetchSubscription();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated]);

  // Listen for role changes to refresh subscription
  useEffect(() => {
    const handleRoleChange = () => {
      console.log("Role changed event received, refreshing subscription...");
      fetchSubscription();
    };

    window.addEventListener('roleChanged', handleRoleChange);
    
    return () => {
      window.removeEventListener('roleChanged', handleRoleChange);
    };
  }, []);

  const isSubscribed = Boolean(
    subscription && ["active", "trialing"].includes(subscription.status)
  );
  const isTrialing = Boolean(subscription?.status === "trialing");
  const hasActiveSubscription = Boolean(subscription?.status === "active");

  const value = useMemo(() => ({
    subscription,
    subscriptionPlan,
    isLoading,
    isSubscribed,
    isTrialing,
    hasActiveSubscription,
    refreshSubscription: fetchSubscription,
  }), [subscription, subscriptionPlan, isLoading, isSubscribed, isTrialing, hasActiveSubscription, fetchSubscription]);

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      "useSubscription must be used within a SubscriptionProvider"
    );
  }
  return context;
}
