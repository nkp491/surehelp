/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_STRIPE_AGENT_PRO_MONTHLY_PRICE_ID: string;
  readonly VITE_STRIPE_AGENT_PRO_ANNUAL_PRICE_ID: string;
  readonly VITE_STRIPE_MANAGER_PRO_MONTHLY_PRICE_ID: string;
  readonly VITE_STRIPE_MANAGER_PRO_ANNUAL_PRICE_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
