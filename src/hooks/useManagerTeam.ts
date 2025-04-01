
import { useToast } from "@/hooks/use-toast";
import { TeamMember } from "@/types/team";
import { useFetchTeamMembers, useFetchTeamMembersByTeam, useFetchNestedTeamMembers } from "./team/useFetchTeamMembers";
import { useTeamMemberOperations } from "./team/useTeamMemberOperations";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Main hook for manager team functionality
 */
export const useManagerTeam = (managerId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
    try {
      const results = await Promise.allSettled([
        refetchTeamMembers(),
        refetchNested()
      ]);
      
      // Even if some refetches fail, continue with invalidating queries
      
      // Invalidate all team-related queries
      queryClient.invalidateQueries({ queryKey: ['team-members-by-team'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
      
      // Check if both or at least one refetch was successful
      const allSuccessful = results.every(result => result.status === 'fulfilled');
      if (!allSuccessful) {
        console.warn("Some team data refetches were not successful");
      }
      
      return true;
    } catch (error) {
      console.error("Error refreshing team data:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh team data. Please try again.",
        variant: "destructive",
      });
      return false;
    }
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
