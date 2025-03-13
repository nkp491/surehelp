
import { useTeams } from "./team/useTeams";
import { useTeamMembers } from "./team/useTeamMembers";
import { useTeamPermissions } from "./team/useTeamPermissions";

/**
 * Main hook for team management, combining multiple specialized hooks
 */
export const useTeamManagement = () => {
  // Get team management hooks
  const { teams, isLoadingTeams, createTeam, updateTeam, isLoading: isLoadingTeamOps } = useTeams();
  const { 
    getTeamMembers, 
    fetchTeamMembers, 
    addTeamMember, 
    removeTeamMember, 
    updateTeamMemberRole, 
    isLoading: isLoadingMemberOps 
  } = useTeamMembers();
  const { isTeamManager } = useTeamPermissions();

  // Combined loading state
  const isLoading = isLoadingTeamOps || isLoadingMemberOps;

  // Create a function to use team members that returns the query
  const useTeamMembers = (teamId?: string) => {
    return fetchTeamMembers(teamId);
  };

  return {
    // Teams
    teams,
    isLoadingTeams,
    createTeam,
    updateTeam,
    
    // Team members
    useTeamMembers,
    getTeamMembers,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    
    // Permissions
    isTeamManager,
    
    // Loading state
    isLoading
  };
};
