
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
      }
    } else if (!profileData.notification_preferences || Array.isArray(profileData.notification_preferences)) {
      sanitized.notification_preferences = {
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
    }
    
    // Ensure skills is an array
    if (!sanitized.skills) {
      sanitized.skills = [];
    } else if (typeof sanitized.skills === 'string') {
      try {
        sanitized.skills = JSON.parse(sanitized.skills);
      } catch (e) {
        sanitized.skills = [];
      }
    }
    
    // Ensure extended_contact is an object
    if (!sanitized.extended_contact) {
      sanitized.extended_contact = {
        work_email: null,
        personal_email: null,
        work_phone: null,
        home_phone: null,
        emergency_contact: null
      };
    } else if (typeof sanitized.extended_contact === 'string') {
      try {
        sanitized.extended_contact = JSON.parse(sanitized.extended_contact);
      } catch (e) {
        sanitized.extended_contact = {
          work_email: null,
          personal_email: null,
          work_phone: null,
          home_phone: null,
          emergency_contact: null
        };
      }
    }
    
    return sanitized as Profile;
  };

  return { sanitizeProfileData };
};
