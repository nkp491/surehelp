
import { useQuery } from "@tanstack/react-query";
import { fetchTeamMembersByTeam } from "./utils/teamMembers";
import { useToast } from "@/hooks/use-toast";

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
