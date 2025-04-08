
-- Create a function to get user creation dates from auth.users
-- This function needs to be executed with appropriate permissions
CREATE OR REPLACE FUNCTION public.get_users_created_at()
RETURNS TABLE (
  id uuid,
  created_at timestamptz
) 
LANGUAGE sql
SECURITY DEFINER -- This ensures the function runs with the permissions of the creator
SET search_path = ''
AS $$
  SELECT id, created_at FROM auth.users;
$$;

-- Grant execute permission to this function for the authenticated users
GRANT EXECUTE ON FUNCTION public.get_users_created_at() TO authenticated;
