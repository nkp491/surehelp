
import { useProfileData } from "./profile/useProfileData";
import { useProfileUpdate } from "./profile/useProfileUpdate";
import { useProfileAvatar } from "./profile/useProfileAvatar";
import { useAuthActions } from "./profile/useAuthActions";

/**
 * Main profile management hook that combines all profile-related functionality
 */
export const useProfileManagement = () => {
  // Fetch profile data
  const { profile, isLoading, refetch, invalidateProfile } = useProfileData();
  
  // Profile update functionality
  const { updateProfile } = useProfileUpdate(refetch, invalidateProfile);
  
  // Avatar upload functionality
  const { uploading, uploadAvatar } = useProfileAvatar(updateProfile);
  
  // Authentication actions
  const { signOut } = useAuthActions(refetch);

  return {
    profile,
    loading: isLoading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut
  };
};
