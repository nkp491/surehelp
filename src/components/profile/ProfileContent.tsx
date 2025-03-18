
import { useProfileManagement } from "@/hooks/useProfileManagement";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileLoading from "@/components/profile/ProfileLoading";
import ProfileSections from "@/components/profile/ProfileSections";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { QueryClient, useQueryClient } from "@tanstack/react-query";

const ProfileContent = () => {
  const {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut,
    forceProfileSync,
    isSyncing
  } = useProfileManagement();

  const queryClient = useQueryClient();
  const { language } = useLanguage();
  const t = translations[language];

  if (loading) {
    return <ProfileLoading />;
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <ProfileHeader onSignOut={signOut} />
      
      <ProfileSections
        profile={profile}
        uploading={uploading}
        updateProfile={updateProfile}
        uploadAvatar={uploadAvatar}
        isSyncing={isSyncing}
        forceProfileSync={forceProfileSync}
      />
    </div>
  );
};

export default ProfileContent;
