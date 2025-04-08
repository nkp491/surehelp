
import { useQuery } from "@tanstack/react-query";
import { fetchNestedTeamMembers } from "./utils/teamMembers";

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
