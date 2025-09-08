-- Fix critical security issue: Replace overly permissive RLS policies on daily_metrics table
-- Drop the existing dangerous "Authenticated users can access" policy
DROP POLICY IF EXISTS "Authenticated users can access" ON public.daily_metrics;

-- Create secure RLS policies for daily_metrics table
-- Policy 1: Users can only view their own metrics data
CREATE POLICY "Users can view own metrics" 
ON public.daily_metrics 
FOR SELECT 
USING (user_id = auth.uid());

-- Policy 2: Users can only insert their own metrics data
CREATE POLICY "Users can insert own metrics" 
ON public.daily_metrics 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Policy 3: Users can only update their own metrics data
CREATE POLICY "Users can update own metrics" 
ON public.daily_metrics 
FOR UPDATE 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Policy 4: Users can only delete their own metrics data
CREATE POLICY "Users can delete own metrics" 
ON public.daily_metrics 
FOR DELETE 
USING (user_id = auth.uid());

-- Policy 5: System admins can view all metrics (for admin dashboard functions)
CREATE POLICY "System admins can view all metrics" 
ON public.daily_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

-- Policy 6: Team managers can view metrics of their team members
CREATE POLICY "Managers can view team metrics" 
ON public.daily_metrics 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = daily_metrics.user_id 
    AND p.manager_id = auth.uid()
  )
);