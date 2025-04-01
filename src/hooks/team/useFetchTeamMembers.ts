
import { useQuery } from "@tanstack/react-query";
import { fetchManagerTeamMembers, fetchTeamMembersByTeam, fetchNestedTeamMembers } from "./utils/teamMemberUtils";
import { TeamMember } from "@/types/team";

/**
 * Hook to fetch team members for a specific manager
 */
export const useFetchTeamMembers = (managerId?: string) => {
  const { 
    data: teamMembers, 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['manager-team', managerId],
    queryFn: async () => {
      if (!managerId) return [];
      return fetchManagerTeamMembers(managerId);
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
  return useQuery({
    queryKey: ['team-members-by-team', teamId],
    queryFn: () => fetchTeamMembersByTeam(teamId!),
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
    queryFn: () => fetchNestedTeamMembers(managerId!),
    enabled: !!managerId && (managerId?.length > 0),
    staleTime: 1000 * 60 * 2,
    retry: 2,
  });
};
