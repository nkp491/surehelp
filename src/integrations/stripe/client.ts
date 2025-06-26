import { loadStripe } from "@stripe/stripe-js";

const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!STRIPE_PUBLISHABLE_KEY) {
  throw new Error("Missing Stripe publishable key");
}

export const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
