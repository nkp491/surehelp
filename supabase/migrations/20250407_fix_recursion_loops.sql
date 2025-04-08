
-- Fix for team association recursion issues

-- Create a more effective function to get a user's teams - simpler approach to avoid recursion
CREATE OR REPLACE FUNCTION public.get_user_teams_secure(check_user_id UUID DEFAULT auth.uid())
RETURNS UUID[]
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result UUID[];
BEGIN
  -- Simple approach that directly queries the team members table
  SELECT array_agg(team_id) INTO result
  FROM public.team_members
  WHERE user_id = check_user_id;

  RETURN result;
END;
$$;

-- Helper function to check if a user is part of a team
CREATE OR REPLACE FUNCTION public.is_user_in_team(check_user_id UUID, check_team_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.team_members
    WHERE user_id = check_user_id AND team_id = check_team_id
  );
END;
$$;

-- Function to add a user to their manager's teams (for use in team association)
CREATE OR REPLACE FUNCTION public.add_user_to_manager_teams(user_id UUID, manager_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id UUID;
  v_added boolean := false;
BEGIN
  -- Get all teams the manager is part of
  FOR v_team_id IN (
    SELECT team_id
    FROM public.team_members
    WHERE user_id = manager_id
  ) LOOP
    -- Check if user is already in this team
    IF NOT EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_id = v_team_id AND user_id = user_id
    ) THEN
      -- Add user to the team
      INSERT INTO public.team_members (team_id, user_id, role)
      VALUES (v_team_id, user_id, 'agent');
      v_added := true;
    END IF;
  END LOOP;
  
  RETURN v_added;
END;
$$;

-- Force function for agent team association
CREATE OR REPLACE FUNCTION public.force_agent_team_association(agent_id UUID DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_manager_id UUID;
  v_team_id UUID;
  v_added boolean := false;
BEGIN
  -- Get the agent's manager
  SELECT manager_id INTO v_manager_id
  FROM public.profiles
  WHERE id = agent_id;
  
  -- If user has a manager, try to add them to their manager's teams
  IF v_manager_id IS NOT NULL THEN
    -- Use the function we already created
    v_added := public.add_user_to_manager_teams(agent_id, v_manager_id);
  END IF;
  
  RETURN v_added;
END;
$$;

-- Clean up RLS policies to avoid recursion issues - data expression check
DO $$
DECLARE
  r RECORD;
  policy_name text;
  table_name text;
  policy_definition text;
BEGIN
  -- Find policies that might have nested checks causing recursion
  FOR r IN 
    SELECT p.policyname, p.tablename, p.cmd
    FROM pg_policies p
    WHERE p.policyname LIKE '%teams%'
        OR p.policyname LIKE '%team_members%'
        OR p.schemaname = 'public'
  LOOP
    policy_name := r.policyname;
    table_name := r.tablename;
    
    -- Log policy we're checking
    RAISE NOTICE 'Checking policy: % on table %', policy_name, table_name;
    
    -- Check and fix potentially recursive policies
    IF position('get_user_role' in r.cmd) > 0 OR position('get_user_teams' in r.cmd) > 0 THEN
      RAISE NOTICE 'Potential recursion detected in policy: %', policy_name;
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', policy_name, table_name);
      
      -- Create a safer version of the policy using our new secure functions
      -- Note: This is a conservative drop - we're not recreating the policies here
      -- because we don't want to make assumptions about their intentions
      RAISE NOTICE 'Dropped potentially recursive policy: %', policy_name;
    END IF;
  END LOOP;
END $$;
