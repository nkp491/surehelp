
import { useTeamOperations } from "./team/useTeamOperations";
import { useTeamQueries } from "./team/useTeamQueries";
import { useTeamDirectQuery } from "./team/useTeamDirectQuery";
import { useTeamPermissions } from "./team/useTeamPermissions";

/**
 * Main hook for team management, combining multiple specialized hooks
 */
export const useTeamManagement = () => {
  // Get specialized hooks
  const operations = useTeamOperations();
  const queries = useTeamQueries();
  const { isTeamManager } = useTeamPermissions();
  
  // Function to get teams directly, bypassing RLS issues
  const getTeamsDirectQuery = (userId?: string) => {
    return useTeamDirectQuery(userId);
  };

  return {
    // Teams operations
    teams: operations.teams,
    isLoadingTeams: operations.isLoadingTeams,
    createTeam: operations.createTeam,
    updateTeam: operations.updateTeam,
    addUserToTeam: operations.addUserToTeam,
    refetchTeams: operations.refetchTeams,
    
    // Team members operations
    useTeamMembers: queries.useTeamMembers,
    addTeamMember: operations.addTeamMember,
    removeTeamMember: operations.removeTeamMember,
    updateTeamMemberRole: operations.updateTeamMemberRole,
    
    // Permissions
    isTeamManager,
    
    // Direct team access (bypassing RLS)
    getTeamsDirectQuery,
    
    // Loading state
    isLoading: operations.isLoading
  };
};
