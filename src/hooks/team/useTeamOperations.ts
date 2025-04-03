
import { useTeams } from "./useTeams";
import { useTeamMembers } from "./useTeamMembers";

/**
 * Hook to handle team operations
 */
export const useTeamOperations = () => {
  // Get team management hooks
  const { 
    teams, 
    isLoadingTeams, 
    createTeam, 
    updateTeam, 
    addUserToTeam,
    refetchTeams,
    isLoading: isLoadingTeamOps 
  } = useTeams();
  
  const { 
    addTeamMember, 
    removeTeamMember, 
    updateTeamMemberRole, 
    isLoading: isLoadingMemberOps 
  } = useTeamMembers();

  // Combined loading state
  const isLoading = isLoadingTeamOps || isLoadingMemberOps;

  return {
    // Team operations
    teams,
    isLoadingTeams,
    createTeam,
    updateTeam,
    addUserToTeam,
    refetchTeams,
    
    // Team member operations
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    
    // Loading state
    isLoading
  };
};
