
import { useQuery } from "@tanstack/react-query";
import { useFetchTeamMembers } from "./useFetchTeamMembers";
import { Team } from "@/types/team";

/**
 * Hook to provide team query functionality
 */
export const useTeamQueries = () => {
  // Function to get team members that returns the query
  const getTeamMembersQuery = (teamId?: string) => {
    return useFetchTeamMembers(teamId);
  };

  return {
    useTeamMembers: getTeamMembersQuery
  };
};
