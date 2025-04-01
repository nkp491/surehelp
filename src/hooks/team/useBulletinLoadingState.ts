
import { useMemo } from "react";

interface LoadingStates {
  isLoadingCreate: boolean;
  isLoadingUpdate: boolean;
  isLoadingToggle: boolean;
  isLoadingDelete: boolean;
}

/**
 * Hook to manage combined loading state for bulletin operations
 */
export const useBulletinLoadingState = ({
  isLoadingCreate,
  isLoadingUpdate,
  isLoadingToggle,
  isLoadingDelete
}: LoadingStates) => {
  const isLoading = useMemo(
    () => isLoadingCreate || isLoadingUpdate || isLoadingToggle || isLoadingDelete,
    [isLoadingCreate, isLoadingUpdate, isLoadingToggle, isLoadingDelete]
  );

  return { isLoading };
};
