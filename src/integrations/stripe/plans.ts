import { SubscriptionPlan } from "./types";

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: "agent_pro",
    name: "Agent Pro",
    description:
      "Perfect for growing agents who want advanced features and unlimited assessments",
    role: "agent_pro",
    features: [
      "Unlimited client assessments",
      "Advanced analytics & reporting",
      "CSV export capabilities",
      "Commission tracking",
      "Priority support",
      "Historical data insights",
    ],
    monthlyPrice: 29.99,
    annualPrice: 299.99, // 16% discount for annual
    stripePriceIdMonthly:
      import.meta.env.VITE_STRIPE_AGENT_PRO_MONTHLY_PRICE_ID || "",
    stripePriceIdAnnual:
      import.meta.env.VITE_STRIPE_AGENT_PRO_ANNUAL_PRICE_ID || "",
    popular: true,
  },
];

export const TRIAL_DAYS = 14;

export const PLAN_ROLE_MAPPING = {
  agent_pro: "agent_pro",
} as const;

export function getPlanByRole(role: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.role === role);
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}
