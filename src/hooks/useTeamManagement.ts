
import { useTeams } from "./team/useTeams";
import { useTeamMembers } from "./team/useTeamMembers";
import { useTeamPermissions } from "./team/useTeamPermissions";
import { useTeamHierarchy } from "./team/useTeamHierarchy";
import { useTeamInvitations } from "./team/useTeamInvitations";
import { hasManagerPermission } from "@/utils/team/managerTierUtils";

/**
 * Main hook for team management, combining multiple specialized hooks
 */
export const useTeamManagement = () => {
  // Get team management hooks
  const { 
    teams, 
    isLoadingTeams, 
    createTeam, 
    updateTeam, 
    refreshTeams, 
    isLoading: isLoadingTeamOps,
    lastRefreshError,
    isTeamMembersFetching
  } = useTeams();
  
  const { 
    getTeamMembers, 
    fetchTeamMembers, 
    addTeamMember, 
    removeTeamMember, 
    updateTeamMemberRole, 
    isLoading: isLoadingMemberOps 
  } = useTeamMembers();
  
  const { 
    isTeamManager,
    isSystemAdmin,
    hasManagerTier,
    isTeamOwner,
    canViewTeamHierarchy,
    canEditTeamSettings
  } = useTeamPermissions();

  // Add the team hierarchy hook
  const {
    fetchHierarchy,
    useHierarchyQuery,
    loading: isLoadingHierarchy,
    error: hierarchyError,
    canViewHierarchy
  } = useTeamHierarchy();

  // Add the team invitations hook
  const {
    teamInvitations,
    isLoadingTeamInvitations,
    refreshTeamInvitations,
    userInvitations,
    isLoadingUserInvitations,
    refreshUserInvitations,
    createInvitation,
    updateInvitationStatus,
    deleteInvitation,
    isLoading: isLoadingInvitations
  } = useTeamInvitations();

  // Combined loading state
  const isLoading = 
    isLoadingTeamOps || 
    isLoadingMemberOps || 
    isLoadingHierarchy || 
    isLoadingInvitations;

  // Create a function to get team members that returns the query
  const getTeamMembersQuery = (teamId?: string) => {
    return fetchTeamMembers(teamId);
  };

  // Get user's manager tier and permissions for a specific team
  const getManagerPermissionsForTeam = async (teamId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    
    try {
      const { data, error } = await supabase
        .from('team_members')
        .select('role')
        .eq('team_id', teamId)
        .eq('user_id', user.id)
        .single();
      
      if (error || !data) {
        // Check if user is system admin
        const isAdmin = await isSystemAdmin();
        return isAdmin ? { role: 'system_admin', permissions: getManagerPermissionsForRole('system_admin') } : null;
      }
      
      return {
        role: data.role,
        permissions: getManagerPermissionsForRole(data.role)
      };
    } catch (error) {
      console.error("Error getting manager permissions:", error);
      return null;
    }
  };
  
  // Get permissions for a role
  const getManagerPermissionsForRole = (role: string) => {
    return {
      canViewHierarchy: hasManagerPermission(role, 'canViewHierarchy'),
      canViewSubteams: hasManagerPermission(role, 'canViewSubteams'),
      canViewAdvancedMetrics: hasManagerPermission(role, 'canViewAdvancedMetrics'),
      canExportTeamData: hasManagerPermission(role, 'canExportTeamData'),
      canManageSubteams: hasManagerPermission(role, 'canManageSubteams'),
      maxTeamDepth: hasManagerPermission(role, 'maxTeamDepth'),
      maxMembersPerTeam: hasManagerPermission(role, 'maxMembersPerTeam')
    };
  };

  return {
    // Teams
    teams,
    isLoadingTeams,
    isTeamMembersFetching,
    createTeam,
    updateTeam,
    refreshTeams,
    lastRefreshError,
    
    // Team members
    useTeamMembers: getTeamMembersQuery,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    
    // Permissions
    isTeamManager,
    isSystemAdmin,
    hasManagerTier,
    isTeamOwner,
    canViewTeamHierarchy,
    canEditTeamSettings,
    getManagerPermissionsForTeam,
    getManagerPermissionsForRole,
    
    // Hierarchy
    fetchHierarchy,
    useHierarchyQuery,
    isLoadingHierarchy,
    hierarchyError,
    canViewHierarchy,
    
    // Invitations
    teamInvitations,
    isLoadingTeamInvitations,
    refreshTeamInvitations,
    userInvitations,
    isLoadingUserInvitations,
    refreshUserInvitations,
    createInvitation,
    updateInvitationStatus,
    deleteInvitation,
    
    // Loading state
    isLoading
  };
};

// Add missing import
import { supabase } from "@/integrations/supabase/client";
