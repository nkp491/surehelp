
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for checking team permissions
 */
export const useTeamPermissions = () => {
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

  // Check if user has system admin role
  const isSystemAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'system_admin')
      .single();

    if (error || !data) return false;
    return true;
  };

  return {
    isTeamManager,
    isSystemAdmin
  };
};
