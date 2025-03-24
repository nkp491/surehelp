
import { Profile } from "./profile";

// Create a minimal version of Profile without recursive properties
export interface ProfileMinimal {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  role: "agent" | "manager_pro" | "beta_user" | "manager_pro_gold" | "manager_pro_platinum" | "agent_pro" | "system_admin" | null;
  roles?: string[];
  created_at: string;
  updated_at: string;
  last_sign_in: string | null;
  language_preference: string | null;
  privacy_settings: {
    show_email: boolean;
    show_phone: boolean;
    show_photo: boolean;
  } | null;
  notification_preferences: {
    email_notifications: boolean;
    in_app_notifications: boolean;
    sms_notifications: boolean;
    team_updates: boolean;
    meeting_reminders: boolean;
    performance_updates: boolean;
    system_announcements: boolean;
    role_changes: boolean;
    do_not_disturb: boolean;
    quiet_hours: {
      enabled: boolean;
      start: string;
      end: string;
    };
  } | null;
  skills: string[] | null;
  bio: string | null;
  job_title: string | null;
  department: string | null;
  location: string | null;
  reports_to: string | null;
  hire_date: string | null;
  extended_contact: {
    work_email: string | null;
    personal_email: string | null;
    work_phone: string | null;
    home_phone: string | null;
    emergency_contact: string | null;
  } | null;
}

// Create fixed reporting structure using ProfileMinimal
export interface ReportingStructureFixed {
  manager: ProfileMinimal | null;
  directReports: ProfileMinimal[];
}

// Helper function to convert from Profile to ProfileMinimal
export const toProfileMinimal = (profile: any): ProfileMinimal => {
  const {
    id,
    first_name,
    last_name,
    email,
    phone,
    profile_image_url,
    role,
    roles,
    created_at,
    updated_at,
    last_sign_in,
    language_preference,
    privacy_settings,
    notification_preferences,
    skills,
    bio,
    job_title,
    department,
    location,
    reports_to,
    hire_date,
    extended_contact
  } = profile;

  return {
    id,
    first_name,
    last_name,
    email,
    phone,
    profile_image_url,
    role,
    roles,
    created_at,
    updated_at,
    last_sign_in,
    language_preference,
    privacy_settings,
    notification_preferences,
    skills,
    bio,
    job_title,
    department,
    location,
    reports_to,
    hire_date,
    extended_contact
  };
};
