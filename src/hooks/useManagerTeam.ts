
import { useToast } from "@/hooks/use-toast";
import { TeamMember } from "@/types/team";
import { useFetchTeamMembers, useFetchTeamMembersByTeam, useFetchNestedTeamMembers } from "./team/useFetchTeamMembers";
import { useTeamMemberOperations } from "./team/useTeamMemberOperations";

/**
 * Main hook for manager team functionality
 */
export const useManagerTeam = (managerId?: string) => {
  const { toast } = useToast();

  // Fetch direct reports
  const { 
    teamMembers, 
    isLoading: isLoadingTeamMembers, 
    error, 
    refetch: refetchTeamMembers 
  } = useFetchTeamMembers(managerId);

  // Fetch nested team members
  const { 
    data: nestedTeamMembers, 
    isLoading: isLoadingNested, 
    refetch: refetchNested 
  } = useFetchNestedTeamMembers(managerId);

  // Combined refetch function
  const refetch = async () => {
    await refetchTeamMembers();
    await refetchNested();
  };

  // Team member operations (with refetch on success)
  const { 
    updateTeamMemberManager, 
    isUpdating 
  } = useTeamMemberOperations(refetch);

  // Helper function to get a query for team members by team
  const getTeamMembersByTeamQuery = (teamId?: string) => {
    return useFetchTeamMembersByTeam(teamId);
  };

  return {
    teamMembers,
    nestedTeamMembers,
    isLoading: isLoadingTeamMembers || isLoadingNested || isUpdating,
    error,
    updateTeamMemberManager,
    refetch,
    getTeamMembersByTeamQuery
  };
};

export default useManagerTeam;
