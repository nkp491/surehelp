
import { useQuery } from "@tanstack/react-query";
import { Team } from "@/types/team";
import { fetchUserTeams } from "./utils/teamUtils";

/**
 * Hook to fetch teams the current user belongs to
 */
export const useFetchTeams = () => {
  const fetchTeams = useQuery({
    queryKey: ['user-teams'],
    queryFn: fetchUserTeams,
  });

  return {
    teams: fetchTeams.data as Team[] | undefined,
    isLoadingTeams: fetchTeams.isLoading,
    error: fetchTeams.error,
    refetchTeams: fetchTeams.refetch,
  };
};
