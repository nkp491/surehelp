import { useProfileManagement } from "@/hooks/useProfileManagement";
import type { Profile } from "@/types/profile";
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
import { RefreshCw } from "lucide-react";

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
    signOut,
    forceProfileSync,
    isSyncing
  } = useProfileManagement();

  const { toast } = useToast();
  const { language } = useLanguage();
  const t = translations[language];

  const defaultPrivacySettings = {
    show_email: false,
    show_phone: false,
    show_photo: true,
  };

  const defaultNotificationPreferences = {
    email_notifications: true,
    phone_notifications: false,
  };

  const sanitizedPrivacySettings = typeof profile?.privacy_settings === 'object' && profile?.privacy_settings !== null
    ? { ...defaultPrivacySettings, ...profile.privacy_settings }
    : defaultPrivacySettings;

  const sanitizedNotificationPreferences = typeof profile?.notification_preferences === 'object' && profile?.notification_preferences !== null
    ? { ...defaultNotificationPreferences, ...profile.notification_preferences }
    : defaultNotificationPreferences;

  const hasBetaAccess = profile?.roles?.includes("beta_user") || false;

  const handleForceSync = async () => {
    if (!profile?.id) {
      toast({
        title: "Error",
        description: "No active user profile found",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const syncResult = await forceProfileSync(profile.id);
      
      if (syncResult) {
        toast({
          title: "Success",
          description: "Profile data synchronized successfully with auth metadata.",
        });
        
        queryClient.invalidateQueries({ queryKey: ['profile'] });
      } else {
        toast({
          title: "Warning",
          description: "Synchronization may not have completed successfully. Please check logs.",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      console.error("Profile sync error:", err);
      toast({
        title: "Error",
        description: err.message || "An unknown error occurred during synchronization",
        variant: "destructive",
      });
    }
  };

  const logCurrentState = async () => {
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
      
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        toast({
          title: "Error", 
          description: `Failed to fetch profile data: ${profileError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("==== DEBUG INFO ====");
      console.log("Auth user metadata:", user?.user_metadata);
      console.log("Profiles table data:", profileData);
      console.log("Current profile state:", profile);
      console.log("===================");
      
      toast({
        title: "Debug Info",
        description: "Check console for current state information.",
      });
    } catch (err: any) {
      console.error("Debug error:", err);
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
            settings={sanitizedPrivacySettings}
            onUpdate={updateProfile}
          />

          <NotificationPreferences
            preferences={sanitizedNotificationPreferences}
            onUpdate={updateProfile}
          />
          
          <TermsAcceptance />
          
          {hasBetaAccess && (
            <div className="mt-8 p-4 border border-gray-200 rounded-md">
              <h3 className="text-lg font-medium mb-2">Debug Tools</h3>
              <div className="flex flex-wrap gap-3">
                <Button 
                  variant="outline" 
                  onClick={handleForceSync}
                  disabled={isSyncing}
                  className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 flex items-center"
                >
                  {isSyncing && <RefreshCw className="mr-2 h-4 w-4 animate-spin" />}
                  Force Sync Profile Data
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={logCurrentState}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-800"
                >
                  Log Current State
                </Button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                These tools help debug profile synchronization issues between auth.users metadata and the profiles table.
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
      <ProfileContent />
    </QueryClientProvider>
  );
};

export default Profile;
