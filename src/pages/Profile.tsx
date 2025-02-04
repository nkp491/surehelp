import { useProfileManagement } from "@/hooks/useProfileManagement";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileImage from "@/components/profile/ProfileImage";
import PersonalInfo from "@/components/profile/PersonalInfo";
import PrivacySettings from "@/components/profile/PrivacySettings";
import NotificationPreferences from "@/components/profile/NotificationPreferences";
import ProfileLoading from "@/components/profile/ProfileLoading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LanguageToggle from "@/components/LanguageToggle";

const Profile = () => {
  const {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut
  } = useProfileManagement();

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

        <div className="flex flex-col gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Language Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <span className="text-sm text-foreground">Display Language</span>
                <LanguageToggle />
              </div>
            </CardContent>
          </Card>

          <PrivacySettings
            settings={profile?.privacy_settings || { show_email: false, show_phone: false, show_photo: true }}
            onUpdate={updateProfile}
          />

          <NotificationPreferences
            preferences={profile?.notification_preferences || { email_notifications: true, phone_notifications: false }}
            onUpdate={updateProfile}
          />
        </div>
      </div>
    </div>
  );
};

export default Profile;