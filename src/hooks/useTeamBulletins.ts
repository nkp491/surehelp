
import { useCreateBulletin } from "./team/useCreateBulletin";
import { useUpdateBulletin } from "./team/useUpdateBulletin";
import { useToggleBulletinPin } from "./team/useToggleBulletinPin";
import { useDeleteBulletin } from "./team/useDeleteBulletin";
import { useFetchTeamBulletins } from "./team/useFetchTeamBulletins";

/**
 * Hook for managing team bulletins, combining multiple specialized hooks
 */
export const useTeamBulletins = (teamId?: string) => {
  // Get bulletins data
  const { data: bulletins, isLoading: isLoadingBulletins } = useFetchTeamBulletins(teamId);
  
  // Mutation hooks
  const { createBulletin, isLoading: isLoadingCreate } = useCreateBulletin(teamId);
  const { updateBulletin, isLoading: isLoadingUpdate } = useUpdateBulletin(teamId);
  const { toggleBulletinPin, isLoading: isLoadingToggle } = useToggleBulletinPin(teamId);
  const { deleteBulletin, isLoading: isLoadingDelete } = useDeleteBulletin(teamId);

  // Combined loading state
  const isLoading = isLoadingCreate || isLoadingUpdate || isLoadingToggle || isLoadingDelete;

  return {
    bulletins,
    isLoadingBulletins,
    isLoading,
    createBulletin,
    updateBulletin,
    toggleBulletinPin,
    deleteBulletin
  };
};
