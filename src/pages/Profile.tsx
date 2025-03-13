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

  // Debug function to directly test database update
  const testDirectUpdate = async () => {
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
      
      const testData = {
        first_name: "Test",
        last_name: "User"
      };
      
      console.log("Attempting direct update with:", testData);
      
      // Update user metadata directly through auth system
      const { data, error: authError } = await supabase.auth.updateUser({
        data: testData
      });
      
      if (authError) {
        console.error("Error updating user metadata:", authError);
        toast({
          title: "Error",
          description: `Failed to update profile: ${authError.message}`,
          variant: "destructive",
        });
        return;
      }
      
      console.log("User metadata updated successfully:", data);
      
      // Force refresh the profile data
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Success",
        description: "Profile updated successfully. Refresh to see changes.",
      });
    } catch (err: any) {
      console.error("Test update error:", err);
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
          
          {/* Debug button for direct database update */}
          <div className="mt-8 p-4 border border-gray-200 rounded-md">
            <h3 className="text-lg font-medium mb-2">Debug Tools</h3>
            <Button 
              variant="outline" 
              onClick={testDirectUpdate}
              className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800"
            >
              Test Direct DB Update
            </Button>
            <p className="text-sm text-gray-500 mt-2">
              This button will directly update your profile in the database with test values.
            </p>
          </div>
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
