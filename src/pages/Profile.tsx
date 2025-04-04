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
import { TeamInformation } from "@/components/profile/TeamInformation";
import AgentInformation from "@/components/profile/AgentInformation";
import { useLanguage, LanguageProvider } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  
  // Improve manager role detection - check both profile.role and profile.roles
  const isManager = profile?.role?.includes('manager_pro') || 
                    profile?.roles?.some(r => r.includes('manager_pro'));
  
  // Improve agent role detection - check both profile.role and profile.roles
  const isAgent = profile?.role?.includes('agent') || 
                  profile?.roles?.some(r => r.includes('agent'));

  if (loading) {
    return <ProfileLoading />;
  }

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

        <TeamInformation />

        {isAgent && (
          <AgentInformation 
            agentInfo={profile?.agent_info}
            onUpdate={updateProfile}
          />
        )}

        <div className="flex flex-col gap-6">
          <UserRole role={profile?.role} roles={profile?.roles} />

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
