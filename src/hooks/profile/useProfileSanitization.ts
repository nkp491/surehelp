
import { Profile } from "@/types/profile";

export const useProfileSanitization = () => {
  const sanitizeProfileData = (profileData: any): Profile => {
    let sanitized = { ...profileData };
    
    // Sanitize privacy_settings
    if (typeof profileData.privacy_settings === 'string') {
      try {
        sanitized.privacy_settings = JSON.parse(profileData.privacy_settings);
      } catch (e) {
        sanitized.privacy_settings = {
          show_email: false,
          show_phone: false,
          show_photo: true
        };
      }
    } else if (!profileData.privacy_settings || Array.isArray(profileData.privacy_settings)) {
      sanitized.privacy_settings = {
        show_email: false,
        show_phone: false,
        show_photo: true
      };
    }
    
    // Sanitize notification_preferences
    if (typeof profileData.notification_preferences === 'string') {
      try {
        sanitized.notification_preferences = JSON.parse(profileData.notification_preferences);
      } catch (e) {
        sanitized.notification_preferences = {
          email_notifications: true,
          phone_notifications: false
        };
      }
    } else if (!profileData.notification_preferences || Array.isArray(profileData.notification_preferences)) {
      sanitized.notification_preferences = {
        email_notifications: true,
        phone_notifications: false
      };
    }
    
    return sanitized as Profile;
  };

  return { sanitizeProfileData };
};
