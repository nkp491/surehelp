import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import ProfileHeader from "@/components/profile/ProfileHeader";
import ProfileImage from "@/components/profile/ProfileImage";
import PersonalInfo from "@/components/profile/PersonalInfo";
import PrivacySettings from "@/components/profile/PrivacySettings";
import NotificationPreferences from "@/components/profile/NotificationPreferences";
import ProfileLoading from "@/components/profile/ProfileLoading";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const Profile = () => {
  const {
    profile,
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut
  } = useProfileManagement();

  const { teamInvitations, isLoading: teamLoading } = useTeamManagement();

  const handleRoleChange = async (checked: boolean) => {
    console.log('Changing role to:', checked ? 'manager' : 'agent');
    await updateProfile({
      role: checked ? 'manager' : 'agent'
    });
    console.log('Role updated in profile. New profile:', profile);
  };

  if (loading || teamLoading) {
    return <ProfileLoading />;
  }

  const acceptedInvitations = teamInvitations.filter(
    invitation => invitation.status === 'accepted'
  );

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

        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Role Management</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Manager Role</Label>
                <p className="text-sm text-muted-foreground">
                  Enable manager features to create and manage teams
                </p>
              </div>
              <Switch
                checked={profile?.role === 'manager'}
                onCheckedChange={handleRoleChange}
              />
            </div>
            
            {profile?.role === 'manager' && (
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Team Status</h4>
                <div className="flex items-center gap-2">
                  <Badge variant={acceptedInvitations.length > 0 ? "default" : "secondary"}>
                    {acceptedInvitations.length} Team Members
                  </Badge>
                  {acceptedInvitations.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No team members yet. Visit the Manager Dashboard to invite team members.
                    </p>
                  )}
                </div>
              </div>
            )}
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
  );
};

export default Profile;