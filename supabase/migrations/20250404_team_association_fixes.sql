
-- Add RPC function to get a user's teams without running into RLS recursion
CREATE OR REPLACE FUNCTION public.get_user_team_memberships(user_id_param UUID)
RETURNS UUID[]
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT array_agg(team_id)
  FROM public.team_members
  WHERE user_id = user_id_param;
$$;

-- Add RPC function to get a manager's teams without running into RLS recursion
CREATE OR REPLACE FUNCTION public.get_manager_teams(manager_id UUID)
RETURNS UUID[]
LANGUAGE SQL
SECURITY DEFINER
AS $$
  SELECT array_agg(team_id)
  FROM public.team_members
  WHERE user_id = manager_id;
$$;

-- Add function to ensure a user is associated with their manager's teams
CREATE OR REPLACE FUNCTION public.ensure_user_in_manager_teams(user_id UUID, manager_id UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_team_id UUID;
  v_added_count integer := 0;
BEGIN
  -- Get all teams where the manager is a member
  FOR v_team_id IN (
    SELECT team_id
    FROM public.team_members
    WHERE user_id = manager_id
  ) LOOP
    -- Check if user is already a member of this team
    IF NOT EXISTS (
      SELECT 1
      FROM public.team_members
      WHERE team_id = v_team_id AND user_id = user_id
    ) THEN
      -- Add user to team
      INSERT INTO public.team_members (team_id, user_id, role)
      VALUES (v_team_id, user_id, 'agent');
      v_added_count := v_added_count + 1;
    END IF;
  END LOOP;

  RETURN v_added_count > 0;
END;
$$;

-- Add trigger to automatically associate users with their manager's teams when manager changes
CREATE OR REPLACE FUNCTION public.handle_manager_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Only proceed if the manager_id has changed and is not null
  IF (OLD.manager_id IS DISTINCT FROM NEW.manager_id) AND (NEW.manager_id IS NOT NULL) THEN
    -- Add user to all of the new manager's teams
    PERFORM public.ensure_user_in_manager_teams(NEW.id, NEW.manager_id);
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for manager change if it doesn't already exist
DROP TRIGGER IF EXISTS on_manager_change ON public.profiles;
CREATE TRIGGER on_manager_change
  AFTER UPDATE OF manager_id ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_manager_change();
