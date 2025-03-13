
import { useProfileManagement } from "@/hooks/useProfileManagement";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileImage from "@/components/profile/ProfileImage";
import PersonalInfo from "@/components/profile/PersonalInfo";
import PrivacySettings from "@/components/profile/PrivacySettings";
import NotificationPreferences from "@/components/profile/NotificationPreferences";
import TermsAcceptance from "@/components/profile/TermsAcceptance";
import ProfileLoading from "@/components/profile/ProfileLoading";
import UserRole from "@/components/profile/UserRole";
import PasswordSettings from "@/components/profile/PasswordSettings";
import { useLanguage, LanguageProvider } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Profile as ProfileType } from "@/types/profile";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
    },
  },
});

const ProfileContent = () => {
  const {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut
  } = useProfileManagement();

  const { language } = useLanguage();
  const t = translations[language];

  if (loading) {
    return <ProfileLoading />;
  }

  // Function to update just the role
  const handleRoleUpdate = async (newRole: ProfileType["role"]) => {
    await updateProfile({ role: newRole });
  };

  // Check if user is admin or has permission to edit roles
  const canEditRole = profile?.role === "system_admin";

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <ProfileHeader onSignOut={signOut} />
      
      <div className="space-y-6">
        <ProfileImage
          imageUrl={profile?.profile_image_url}
          firstName={profile?.first_name}
          onUpload={uploadAvatar}
          uploading={uploading}
        />

        <PersonalInfo
          firstName={profile?.first_name}
          lastName={profile?.last_name}
          email={profile?.email}
          phone={profile?.phone}
          onUpdate={updateProfile}
        />

        <div className="flex flex-col gap-6">
          <UserRole 
            role={profile?.role} 
            canEditRole={canEditRole}
            onUpdateRole={handleRoleUpdate}
          />

          <PasswordSettings />

          <PrivacySettings
            settings={profile?.privacy_settings || { show_email: false, show_phone: false, show_photo: true }}
            onUpdate={updateProfile}
          />

          <NotificationPreferences
            preferences={profile?.notification_preferences || { email_notifications: true, phone_notifications: false }}
            onUpdate={updateProfile}
          />
          
          <TermsAcceptance />
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ProfileContent />
      </LanguageProvider>
    </QueryClientProvider>
  );
};

export default Profile;
