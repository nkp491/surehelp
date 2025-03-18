
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useProfileSanitization } from "./useProfileSanitization";

export const useDefaultProfile = () => {
  const { sanitizeProfileData } = useProfileSanitization();

  const createDefaultProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const defaultPrivacySettings = {
        show_email: false,
        show_phone: false,
        show_photo: true
      };
      
      const defaultNotificationPreferences = {
        email_notifications: true,
        phone_notifications: false
      };
      
      const newProfile = {
        id: userData.user.id,
        email: userData.user.email,
        first_name: userData.user.user_metadata.first_name || null,
        last_name: userData.user.user_metadata.last_name || null,
        phone: userData.user.user_metadata.phone || null,
        privacy_settings: defaultPrivacySettings,
        notification_preferences: defaultNotificationPreferences
      };
      
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      return sanitizeProfileData(insertedProfile) as Profile;
    }
    throw new Error("User not authenticated");
  };

  return { createDefaultProfile };
};
