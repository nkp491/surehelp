-- Fix security issue: Restrict access to team_members and team_managers tables
-- Remove overly permissive policies and implement proper access control

-- Fix team_members table security
DROP POLICY IF EXISTS "user can insert and read" ON public.team_members;

-- Create restrictive policies for team_members
CREATE POLICY "Users can view team members of their own teams" 
ON public.team_members 
FOR SELECT 
USING (
  -- Users can see members of teams they belong to
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
  OR
  -- System admins can see all team members
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

CREATE POLICY "Team managers can insert team members" 
ON public.team_members 
FOR INSERT 
WITH CHECK (
  -- Only team managers can add members to their teams
  EXISTS (
    SELECT 1 FROM public.team_members 
    WHERE team_id = public.team_members.team_id 
    AND user_id = auth.uid() 
    AND role LIKE 'manager%'
  )
  OR
  -- System admins can add members to any team
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

CREATE POLICY "Team managers can update team members" 
ON public.team_members 
FOR UPDATE 
USING (
  -- Team managers can update members in their teams
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = public.team_members.team_id 
    AND tm.user_id = auth.uid() 
    AND tm.role LIKE 'manager%'
  )
  OR
  -- System admins can update any team member
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

CREATE POLICY "Team managers can delete team members" 
ON public.team_members 
FOR DELETE 
USING (
  -- Team managers can remove members from their teams
  EXISTS (
    SELECT 1 FROM public.team_members tm
    WHERE tm.team_id = public.team_members.team_id 
    AND tm.user_id = auth.uid() 
    AND tm.role LIKE 'manager%'
  )
  OR
  -- System admins can remove any team member
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

-- Fix team_managers table security
DROP POLICY IF EXISTS "Users can create or delete members" ON public.team_managers;

-- Create restrictive policies for team_managers
CREATE POLICY "Users can view team managers of their teams" 
ON public.team_managers 
FOR SELECT 
USING (
  -- Users can see managers of teams they belong to
  team_id IN (
    SELECT team_id FROM public.team_members WHERE user_id = auth.uid()
  )
  OR
  -- System admins can see all team managers
  EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() 
    AND role = 'system_admin'
  )
);

CREATE POLICY "System admins can manage team managers" 
ON public.team_managers 
FOR ALL 
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