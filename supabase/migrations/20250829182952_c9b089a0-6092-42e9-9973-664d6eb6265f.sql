-- Fix CRITICAL security issue: Remove overly permissive user_roles policy
-- that allows privilege escalation and implement proper role management controls

-- Remove the dangerous policy that allows all authenticated users to manage roles
DROP POLICY IF EXISTS "Authenticated can manage user_roles" ON public.user_roles;

-- Create secure, restrictive policies for user_roles management

-- Only system admins can insert new roles
CREATE POLICY "System admins can assign roles" 
ON public.user_roles 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

-- Only system admins can update existing roles
CREATE POLICY "System admins can update roles" 
ON public.user_roles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

-- Only system admins can delete roles
CREATE POLICY "System admins can remove roles" 
ON public.user_roles 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

-- Keep the existing safe viewing policies:
-- - "Users can view their own roles" (already exists)
-- - "Managers can view all user roles" (already exists, reasonable for managers)

-- Add additional protection: Prevent users from modifying system_admin role assignments
-- This is an extra safety measure to prevent any potential bypasses
CREATE POLICY "Prevent unauthorized system_admin modifications" 
ON public.user_roles 
FOR ALL 
USING (
  -- Block any attempt to modify system_admin roles unless user is already system_admin
  CASE 
    WHEN role = 'system_admin' THEN 
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() 
        AND role = 'system_admin'
      )
    ELSE true
  END
)
WITH CHECK (
  -- Block any attempt to assign system_admin roles unless user is already system_admin
  CASE 
    WHEN role = 'system_admin' THEN 
      EXISTS (
        SELECT 1 FROM public.user_roles
        WHERE user_id = auth.uid() 
        AND role = 'system_admin'
      )
    ELSE true
  END
);