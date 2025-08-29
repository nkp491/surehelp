-- Fix security issue: Remove overly permissive profile access policies
-- and implement proper access control for profiles table

-- Drop all the overly permissive policies that allow unrestricted access
DROP POLICY IF EXISTS "Allow public read" ON public.profiles;
DROP POLICY IF EXISTS "Allow users to read any profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by all authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Keep only the secure, restrictive policies:
-- 1. Users can view their own profile (already exists)
-- 2. Managers can view their direct team members (already exists)
-- 3. System admins can view all profiles (already exists)

-- The following policies will remain active:
-- - "Users can view their own profile" USING (auth.uid() = id)
-- - "Managers can view their team members' profiles" USING ((manager_id = auth.uid()) OR (id = auth.uid()))
-- - "Allow system_admin to update any profile" (for system admins)

-- Add a more specific policy for team members to see each other within the same team
CREATE POLICY "Team members can view team profiles" 
ON public.profiles 
FOR SELECT 
USING (
  -- User can see their own profile
  id = auth.uid() 
  OR 
  -- User can see profiles of people in the same teams
  EXISTS (
    SELECT 1 FROM public.team_members tm1
    JOIN public.team_members tm2 ON tm1.team_id = tm2.team_id
    WHERE tm1.user_id = auth.uid() 
    AND tm2.user_id = public.profiles.id
  )
  OR
  -- Managers can see their direct reports
  manager_id = auth.uid()
  OR
  -- System admins can see all profiles
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);