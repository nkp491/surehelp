export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  role: string;
  features: string[];
  monthlyPrice: number;
  annualPrice: number;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
  popular?: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string;
  stripe_subscription_id: string;
  plan_id: string;
  status:
    | "active"
    | "canceled"
    | "incomplete"
    | "incomplete_expired"
    | "past_due"
    | "trialing"
    | "unpaid";
  current_period_start: string;
  current_period_end: string;
  trial_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCheckoutSessionParams {
  priceId: string;
  userId: string;
  trialDays?: number;
}

export interface BillingInterval {
  interval: "monthly" | "annually";
  label: string;
  discount?: number;
}
