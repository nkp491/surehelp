-- Add Manager Pro subscription plan
INSERT INTO subscription_plans (
  id, name, description, role, features, monthly_price, annual_price, 
  stripe_price_id_monthly, stripe_price_id_annual, popular
) VALUES (
  'manager_pro',
  'Manager Pro',
  'For small agencies with a couple of managers and teams',
  'manager_pro',
  '["Everything in Agent Pro", "Manager dashboard access", "Team performance analytics", "Up to 25 team members", "Team bulletin system", "One-on-one meeting scheduling", "Action item management", "Team lead tracking"]'::jsonb,
  250.00,
  1800.00,
  'price_manager_pro_monthly', -- Replace with actual Stripe price ID
  'price_manager_pro_annual',  -- Replace with actual Stripe price ID
  false
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  monthly_price = EXCLUDED.monthly_price,
  annual_price = EXCLUDED.annual_price,
  popular = EXCLUDED.popular,
  updated_at = NOW(); 