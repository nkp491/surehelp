
import { Profile } from "@/types/profile";
import ProfileImage from "@/components/profile/ProfileImage";
import PersonalInfo from "@/components/profile/PersonalInfo";
import UserRole from "@/components/profile/UserRole";
import PasswordSettings from "@/components/profile/PasswordSettings";
import PrivacySettings from "@/components/profile/PrivacySettings";
import NotificationPreferences from "@/components/profile/NotificationPreferences";
import TermsAcceptance from "@/components/profile/TermsAcceptance";
import DebugTools from "@/components/profile/DebugTools";
import ManagerInfo from "@/components/profile/ManagerInfo";
import { useSimplifiedReporting } from "@/hooks/directory/useSimplifiedReporting";
import { useEffect, useState } from "react";

interface ProfileSectionsProps {
  profile: Profile | null;
  uploading: boolean;
  updateProfile: (data: any) => Promise<void>;
  uploadAvatar: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  isSyncing: boolean;
  forceProfileSync: (userId: string) => Promise<boolean>;
}

const ProfileSections = ({
  profile,
  uploading,
  updateProfile,
  uploadAvatar,
  isSyncing,
  forceProfileSync
}: ProfileSectionsProps) => {
  const defaultPrivacySettings = {
    show_email: false,
    show_phone: false,
    show_photo: true,
  };

  const defaultNotificationPreferences = {
    email_notifications: true,
    in_app_notifications: true,
    sms_notifications: false,
    team_updates: true,
    meeting_reminders: true,
    performance_updates: true,
    system_announcements: true,
    role_changes: true,
    do_not_disturb: false,
    quiet_hours: {
      enabled: false,
      start: "22:00",
      end: "07:00"
    }
  };

  // Use type guard to ensure privacy_settings has the correct structure
  const sanitizedPrivacySettings = profile?.privacy_settings && 
    typeof profile.privacy_settings === 'object' && 
    profile.privacy_settings !== null
      ? { ...defaultPrivacySettings, ...profile.privacy_settings }
      : defaultPrivacySettings;

  // Use type guard to ensure notification_preferences has the correct structure
  const sanitizedNotificationPreferences = profile?.notification_preferences && 
    typeof profile.notification_preferences === 'object' && 
    profile.notification_preferences !== null
      ? { ...defaultNotificationPreferences, ...profile.notification_preferences }
      : defaultNotificationPreferences;

  const hasBetaAccess = profile?.roles?.includes("beta_user") || false;
  
  // Get reporting structure for current user
  const { getReportingStructure } = useSimplifiedReporting();
  const [manager, setManager] = useState<any>(null);
  
  useEffect(() => {
    if (profile?.id) {
      getReportingStructure(profile.id).then((structure) => {
        if (structure && structure.manager) {
          setManager(structure.manager);
        }
      });
    }
  }, [profile?.id, getReportingStructure]);

  return (
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
        <UserRole role={profile?.role} roles={profile?.roles} />
        
        <ManagerInfo
          manager={manager}
          onUpdate={updateProfile}
          userRole={profile?.role}
        />

        <PasswordSettings />

        <PrivacySettings
          settings={sanitizedPrivacySettings}
          onUpdate={updateProfile}
        />

        <NotificationPreferences
          preferences={sanitizedNotificationPreferences}
          onUpdate={updateProfile}
        />
        
        <TermsAcceptance />
        
        {hasBetaAccess && (
          <DebugTools 
            profile={profile}
            isSyncing={isSyncing}
            forceProfileSync={forceProfileSync}
          />
        )}
      </div>
    </div>
  );
};

export default ProfileSections;
