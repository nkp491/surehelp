-- Create subscription_plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  role TEXT NOT NULL,
  features JSONB DEFAULT '[]'::jsonb,
  monthly_price DECIMAL(10,2) NOT NULL,
  annual_price DECIMAL(10,2) NOT NULL,
  stripe_price_id_monthly TEXT NOT NULL,
  stripe_price_id_annual TEXT NOT NULL,
  popular BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL UNIQUE,
  plan_id TEXT NOT NULL REFERENCES subscription_plans(id),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  trial_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_stripe_customer_id_idx ON subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for subscription_plans (public read access)
CREATE POLICY "Public can read subscription plans" ON subscription_plans
  FOR SELECT TO authenticated, anon
  USING (true);

-- RLS Policies for subscriptions (users can only see their own)
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions" ON subscriptions
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscriptions" ON subscriptions
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Insert Agent Pro plan
INSERT INTO subscription_plans (
  id, name, description, role, features, monthly_price, annual_price, 
  stripe_price_id_monthly, stripe_price_id_annual, popular
) VALUES (
  'agent_pro',
  'Agent Pro',
  'Perfect for growing agents who want advanced features and unlimited assessments',
  'agent_pro',
  '["Unlimited client assessments", "Advanced analytics & reporting", "CSV export capabilities", "Commission tracking", "Priority support", "Historical data insights"]'::jsonb,
  29.99,
  299.99,
  'price_agent_pro_monthly', -- Replace with actual Stripe price ID
  'price_agent_pro_annual',  -- Replace with actual Stripe price ID
  true
) ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  features = EXCLUDED.features,
  monthly_price = EXCLUDED.monthly_price,
  annual_price = EXCLUDED.annual_price,
  popular = EXCLUDED.popular,
  updated_at = NOW();

-- Insert Manager Pro plan
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

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
CREATE TRIGGER update_subscription_plans_updated_at 
  BEFORE UPDATE ON subscription_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 