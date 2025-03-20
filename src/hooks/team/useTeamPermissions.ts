
import { supabase } from "@/integrations/supabase/client";
import { useRoleCheck } from "@/hooks/useRoleCheck";

/**
 * Hook for checking team permissions
 */
export const useTeamPermissions = () => {
  const { hasRequiredRole } = useRoleCheck();

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

  // Check if user has specific manager tier
  const hasManagerTier = async (teamId: string, tier: 'pro' | 'gold' | 'platinum') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();
      
    if (error || !data) return false;
    
    switch (tier) {
      case 'pro':
        return data.role === 'manager_pro' || 
               data.role === 'manager_pro_gold' || 
               data.role === 'manager_pro_platinum';
      case 'gold':
        return data.role === 'manager_pro_gold' || 
               data.role === 'manager_pro_platinum';
      case 'platinum':
        return data.role === 'manager_pro_platinum';
      default:
        return false;
    }
  };

  // Check if user is the owner/creator of the team
  const isTeamOwner = async (teamId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // We'll need to implement this when we add team ownership tracking
    // For now, we'll consider platinum managers as owners
    return await hasManagerTier(teamId, 'platinum');
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

  // Check if user can view team hierarchies
  const canViewTeamHierarchy = () => {
    return hasRequiredRole(['manager_pro_gold', 'manager_pro_platinum', 'system_admin']);
  };

  // Can user edit team settings
  const canEditTeamSettings = async (teamId: string) => {
    const isAdmin = await isSystemAdmin();
    if (isAdmin) return true;
    
    return await hasManagerTier(teamId, 'gold') || await isTeamOwner(teamId);
  };

  return {
    isTeamManager,
    isSystemAdmin,
    hasManagerTier,
    isTeamOwner,
    canViewTeamHierarchy,
    canEditTeamSettings
  };
};
