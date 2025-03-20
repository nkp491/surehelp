
export type Profile = {
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
  // Team Directory fields
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
};

export type ReportingStructure = {
  manager: Profile | null;
  directReports: Profile[];
};
