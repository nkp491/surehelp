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
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { SmartTeamList } from "@/components/team/SmartTeamList";
import { SubscriptionStatus } from "@/components/subscription/SubscriptionStatus";


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 30,
    },
  },
});

const ProfileContent = () => {
  const { profile, loading, uploading, updateProfile, uploadAvatar, signOut } =
    useProfileManagement();
  const isManager = profile?.roles?.some((role) =>
    ["manager", "manager_pro", "manager_pro_gold", "manager_pro_platinum"].includes(role)
  );

  if (loading) {
    return <ProfileLoading />;
  }

  const validRole = profile?.role as
    | "agent"
    | "agent_pro"
    | "manager"
    | "manager_pro"
    | "manager_pro_gold"
    | "manager_pro_platinum"
    | "beta_user"
    | null;

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <UserRole role={validRole} roles={profile?.roles} />
            <SubscriptionStatus />
            <PasswordSettings />
          </div>

          <div className="space-y-6">
            <PrivacySettings
              settings={
                profile?.privacy_settings || {
                  show_email: false,
                  show_phone: false,
                  show_photo: true,
                }
              }
              onUpdate={updateProfile}
            />

            <NotificationPreferences
              preferences={
                profile?.notification_preferences || {
                  email_notifications: true,
                  phone_notifications: false,
                }
              }
              onUpdate={updateProfile}
            />

            <TermsAcceptance />
          </div>
        </div>

        {isManager && (
          <div className="mt-8">
            <SmartTeamList managerId={profile?.id} />
          </div>
        )}
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
