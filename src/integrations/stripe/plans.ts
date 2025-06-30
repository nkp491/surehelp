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
  {
    id: "manager_pro",
    name: "Manager Pro",
    description: "For small agencies with a couple of managers and teams",
    role: "manager_pro",
    features: [
      "Everything in Agent Pro",
      "Manager dashboard access",
      "Team performance analytics",
      "Up to 25 team members",
      "Team bulletin system",
      "One-on-one meeting scheduling",
      "Action item management",
      "Team lead tracking",
    ],
    monthlyPrice: 250.0,
    annualPrice: 1800.0, // $150/month * 12 (40% discount for annual)
    stripePriceIdMonthly:
      import.meta.env.VITE_STRIPE_MANAGER_PRO_MONTHLY_PRICE_ID || "",
    stripePriceIdAnnual:
      import.meta.env.VITE_STRIPE_MANAGER_PRO_ANNUAL_PRICE_ID || "",
    popular: false,
  },
];

export const TRIAL_DAYS = 14;

export const PLAN_ROLE_MAPPING = {
  agent_pro: "agent_pro",
  manager_pro: "manager_pro",
} as const;

export function getPlanByRole(role: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.role === role);
}

export function getPlanById(planId: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId);
}
