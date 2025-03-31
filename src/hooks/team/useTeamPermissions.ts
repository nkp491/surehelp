
import { supabase } from "@/integrations/supabase/client";
import { useRolesCache } from "@/hooks/useRolesCache";

/**
 * Hook for checking team permissions
 */
export const useTeamPermissions = () => {
  const { userRoles } = useRolesCache();

  // Check if user is team manager
  const isTeamManager = async (teamId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return false;
    return data.role.startsWith('manager_pro');
  };

  // Check if user has system admin role using the cached roles instead of a new query
  const isSystemAdmin = () => {
    return userRoles.includes('system_admin');
  };

  return {
    isTeamManager,
    isSystemAdmin
  };
};
