
import { useProfileData } from "./profile/useProfileData";
import { useAuthState } from "./profile/useAuthState";
import { useProfileUpdate } from "./profile/useProfileUpdate";
import { useAvatarUpload } from "./profile/useAvatarUpload";
import { useSignOut } from "./profile/useSignOut";

/**
 * Main profile management hook that combines all profile-related functionality
 */
export const useProfileManagement = () => {
  // Get profile data and loading state
  const { data: profile, isLoading: loading, refetch } = useProfileData();
  
  // Handle auth state changes
  useAuthState();
  
  // Get profile update functionality
  const { updateProfile } = useProfileUpdate();
  
  // Get avatar upload functionality
  const { uploading, uploadAvatar } = useAvatarUpload();
  
  // Get sign out functionality
  const { signOut } = useSignOut();

  return {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut,
    refetch
  };
};
