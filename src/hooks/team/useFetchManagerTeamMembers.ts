
import { useQuery } from "@tanstack/react-query";
import { fetchManagerTeamMembers } from "./utils/teamMembers";
import { TeamMember } from "@/types/team";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to fetch team members for a specific manager
 */
export const useFetchManagerTeamMembers = (managerId?: string) => {
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
