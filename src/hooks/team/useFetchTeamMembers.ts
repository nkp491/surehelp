
import { useQuery } from "@tanstack/react-query";
import { 
  fetchManagerTeamMembers, 
  fetchTeamMembersByTeam, 
  fetchNestedTeamMembers 
} from "./utils/teamMembers";
import { TeamMember } from "@/types/team";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to fetch team members for a specific manager
 */
export const useFetchTeamMembers = (managerId?: string) => {
  const { toast } = useToast();
  
  const { 
    data: teamMembers, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['manager-team', managerId],
    queryFn: async () => {
      if (!managerId) return [];
      try {
        return await fetchManagerTeamMembers(managerId);
      } catch (err: any) {
        console.error("Error fetching team members:", err);
        return [];
      }
    },
    enabled: !!managerId,
    staleTime: 1000 * 60 * 2, // Consider data fresh for 2 minutes
    refetchOnWindowFocus: true,
    retry: 2,
  });

  return {
    teamMembers,
    isLoading,
    error,
    refetch
  };
};

/**
 * Hook to fetch team members for a specific team
 */
export const useFetchTeamMembersByTeam = (teamId?: string) => {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ['team-members-by-team', teamId],
    queryFn: async () => {
      if (!teamId) return [];
      try {
        return await fetchTeamMembersByTeam(teamId);
      } catch (err: any) {
        console.error("Error fetching team members by team:", err);
        // Don't show toast here as it creates too many error notifications
        return [];
      }
    },
    enabled: !!teamId && teamId.length > 0,
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};

/**
 * Hook to fetch nested team members
 */
export const useFetchNestedTeamMembers = (managerId?: string) => {
  return useQuery({
    queryKey: ['nested-team-members', managerId],
    queryFn: async () => {
      if (!managerId) return [];
      try {
        return await fetchNestedTeamMembers(managerId);
      } catch (err: any) {
        console.error("Error fetching nested team members:", err);
        return [];
      }
    },
    enabled: !!managerId && (managerId?.length > 0),
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};
