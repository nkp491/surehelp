
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
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  // Check if the user has the beta_user role
  const hasBetaAccess = profile?.roles?.includes("beta_user") || false;

  // Direct function to force sync between auth.users and profiles
  const forceSyncProfiles = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Error",
          description: "No active session found",
          variant: "destructive",
        });
        return;
      }
      
      // Get user metadata from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user metadata:", userError);
        toast({
          title: "Error",
          description: `Failed to fetch user data: ${userError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Current auth user metadata:", user?.user_metadata);
      
      if (!user?.user_metadata) {
        toast({
          title: "Error",
          description: "No user metadata found",
          variant: "destructive",
        });
        return;
      }
      
      // Create update payload from user metadata
      const profileUpdate = {
        first_name: user.user_metadata.first_name || null,
        last_name: user.user_metadata.last_name || null,
        phone: user.user_metadata.phone || null
      };
      
      console.log("Forcing profile sync with:", profileUpdate);
      
      // Directly update the profiles table
      const { data: updateResult, error: updateError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", session.user.id)
        .select();
        
      if (updateError) {
        console.error("Error syncing profile:", updateError);
        toast({
          title: "Error",
          description: `Failed to sync profile: ${updateError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("Profile sync result:", updateResult);
      
      // Force refresh the profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Success",
        description: "Profile synced successfully. Refresh to see changes.",
      });
    } catch (err: any) {
      console.error("Profile sync error:", err);
      toast({
        title: "Error",
        description: err.message || "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

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
          
          {/* Debug tools for beta users */}
          {hasBetaAccess && (
            <div className="mt-8 p-4 border border-gray-200 rounded-md">
              <h3 className="text-lg font-medium mb-2">Debug Tools</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={forceSyncProfiles}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
                >
                  Force Sync Profiles Table
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                These tools help debug profile synchronization issues between auth.users and the profiles table.
              </p>
            </div>
          )}
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
