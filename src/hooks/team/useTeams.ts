
import { useState } from "react";
import { useFetchTeams } from "./useFetchTeams";
import { useCreateTeam } from "./useCreateTeam";
import { useUpdateTeam } from "./useUpdateTeam";
import { useAddUserToTeam } from "./useAddUserToTeam";
import { Team } from "@/types/team";

/**
 * Hook to fetch and manage teams
 */
export const useTeams = () => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Get teams hooks
  const { teams, isLoadingTeams, error, refetchTeams } = useFetchTeams();
  const { createTeam, isLoading: isLoadingCreate } = useCreateTeam();
  const { updateTeam, isLoading: isLoadingUpdate } = useUpdateTeam();
  const { addUserToTeam, isLoading: isLoadingAddUser } = useAddUserToTeam();

  // Combine loading states
  const isLoadingOperations = isLoadingCreate || isLoadingUpdate || isLoadingAddUser;

  return {
    teams,
    isLoadingTeams,
    error,
    createTeam,
    updateTeam,
    addUserToTeam,
    refetchTeams,
    isLoading: isLoadingOperations
  };
};
