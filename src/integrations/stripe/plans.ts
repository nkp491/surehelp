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
    description:
      "For small agencies with a couple of managers and teams",
    role: "manager_pro",
    features: [
      "Unlimited client assessments",
      "Advanced analytics & reporting",
      "CSV export capabilities",
      "Commission tracking",
      "Priority support",
      "Historical data insights",
    ],
    monthlyPrice: 250,
    annualPrice: 1800, // 16% discount for annual
    stripePriceIdMonthly:
      import.meta.env.VITE_STRIPE_MANAGER_PRO_MONTHLY_PRICE_ID || "",
    stripePriceIdAnnual:
      import.meta.env.VITE_STRIPE_MANAGER_PRO_ANNUAL_PRICE_ID || "",
    popular: false,
  },
  {
    id: "manager_pro_gold",
    name: "Manager Pro Gold",
    description:
      "For medium agencies with multiple managers and teams",
    role: "manager_pro_gold",
    features: [
      "Unlimited client assessments",
      "Advanced analytics & reporting",
      "CSV export capabilities",
      "Commission tracking",
      "Priority support",
      "Historical data insights",
    ],
    monthlyPrice: 500,
    annualPrice: 3600, // 16% discount for annual
    stripePriceIdMonthly:
      import.meta.env.VITE_STRIPE_MANAGER_PRO_GOLD_MONTHLY_PRICE_ID || "",
    stripePriceIdAnnual:
      import.meta.env.VITE_STRIPE_MANAGER_PRO_GOLD_ANNUAL_PRICE_ID || "",
    popular: false,
  },
  {
    id: "manager_pro_platinum",
    name: "Manager Pro Platinum",
    description:
      "For large agencies with multiple levels of managers and teams",
    role: "manager_pro_platinum",
    features: [
      "Unlimited client assessments",
      "Advanced analytics & reporting",
      "CSV export capabilities",
      "Commission tracking",
      "Priority support",
      "Historical data insights",
    ],
    monthlyPrice: 1000,
    annualPrice: 7200, // 16% discount for annual
    stripePriceIdMonthly:
      import.meta.env.VITE_STRIPE_MANAGER_PRO_PLATINUM_MONTHLY_PRICE_ID || "",
    stripePriceIdAnnual:
      import.meta.env.VITE_STRIPE_MANAGER_PRO_PLATINUM_ANNUAL_PRICE_ID || "",
    popular: false,
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
