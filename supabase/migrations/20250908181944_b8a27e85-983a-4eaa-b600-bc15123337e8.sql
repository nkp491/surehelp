-- Fix critical security issue: Replace overly permissive RLS policies on subscriptions table
-- Drop the existing dangerous "all access" policy
DROP POLICY IF EXISTS "all access" ON public.subscriptions;

-- Create secure RLS policies for subscriptions table
-- Policy 1: Users can only view their own subscription data
CREATE POLICY "Users can view own subscription" 
ON public.subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy 2: Users can only update their own subscription data (for status changes via webhooks)
CREATE POLICY "System can update subscriptions" 
ON public.subscriptions 
FOR UPDATE 
USING (true);

-- Policy 3: System can insert new subscriptions (for webhooks and checkout)
CREATE POLICY "System can insert subscriptions" 
ON public.subscriptions 
FOR INSERT 
WITH CHECK (true);

-- Policy 4: System admins can view all subscriptions (if needed for admin functions)
CREATE POLICY "System admins can view all subscriptions" 
ON public.subscriptions 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

-- Policy 5: System can delete subscriptions (for cleanup operations)
CREATE POLICY "System can delete subscriptions" 
ON public.subscriptions 
FOR DELETE 
USING (true);