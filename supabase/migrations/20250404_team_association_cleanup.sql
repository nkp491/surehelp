
-- Step 1: Update the is_special_user function to simply return false (instead of checking for specific emails)
CREATE OR REPLACE FUNCTION public.is_special_user(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Previously checked for specific emails; now just returns false
  RETURN FALSE;
END;
$$;

-- Step 2: Update the is_momentum_team function to simply return false
CREATE OR REPLACE FUNCTION public.is_momentum_team(check_team_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Previously checked for "Momentum" in the name; now just returns false
  RETURN FALSE;
END;
$$;

-- Step 3: Replace the handle_momentum_team_membership function with one that does nothing
CREATE OR REPLACE FUNCTION public.handle_momentum_team_membership()
RETURNS TRIGGER
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Previously had special case handling; now does nothing
  RETURN NEW;
END;
$$;

-- Step 4: Update force_agent_team_association to remove special case handling
CREATE OR REPLACE FUNCTION public.force_agent_team_association(agent_id UUID)
RETURNS BOOLEAN
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  v_manager_id UUID;
  v_team_id UUID;
  v_team_count INTEGER := 0;
BEGIN
  -- Get the user's manager
  SELECT manager_id INTO v_manager_id
  FROM public.profiles
  WHERE id = agent_id;
  
  -- If user has a manager
  IF v_manager_id IS NOT NULL THEN
    -- Add user to all teams the manager is associated with
    FOR v_team_id IN (
      SELECT team_id FROM public.team_members WHERE user_id = v_manager_id
    ) LOOP
      INSERT INTO public.team_members (team_id, user_id, role)
      VALUES (v_team_id, agent_id, 'agent')
      ON CONFLICT (team_id, user_id) DO NOTHING;
      
      -- Count teams added
      IF FOUND THEN
        v_team_count := v_team_count + 1;
      END IF;
    END LOOP;
  END IF;
  
  RETURN v_team_count > 0;
END;
$$;

-- Step 5: Create a simplified get_user_teams_secure function
CREATE OR REPLACE FUNCTION public.get_user_teams_secure(check_user_id UUID)
RETURNS SETOF UUID
LANGUAGE SQL
SECURITY DEFINER
SET search_path TO ''
AS $$
  -- Direct team memberships
  SELECT DISTINCT team_id 
  FROM public.team_members 
  WHERE user_id = check_user_id;
$$;
