
import { supabase } from "@/integrations/supabase/client";
import { useRolesCache } from "@/hooks/useRolesCache";

/**
 * Hook for checking team permissions
 * Uses security definer functions to prevent RLS recursion issues
 */
export const useTeamPermissions = () => {
  const { userRoles } = useRolesCache();

  // Check if user is team manager using security definer function
  const isTeamManager = async (teamId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    try {
      // Use security definer function to prevent recursion
      const { data, error } = await supabase.rpc(
        'get_user_manager_status',
        { check_user_id: user.id, check_team_id: teamId }
      );

      if (error || data === null) {
        console.error("Error checking team manager status:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Error in isTeamManager:", error);
      return false;
    }
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
