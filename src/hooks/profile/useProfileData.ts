
import { useProfileFetch } from "./useProfileFetch";
import { useDefaultProfile } from "./useDefaultProfile";
import { useProfileSync } from "./useProfileSync";
import { useProfileSanitization } from "./useProfileSanitization";

export const useProfileData = () => {
  const { profile, isLoading, refetch, invalidateProfile } = useProfileFetch();
  const { createDefaultProfile } = useDefaultProfile();
  const { verifyProfileSync, forceProfileSync } = useProfileSync();
  const { sanitizeProfileData } = useProfileSanitization();

  return {
    profile,
    isLoading,
    refetch,
    invalidateProfile,
    sanitizeProfileData
  };
};
