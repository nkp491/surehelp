
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  role: "agent" | "manager_pro" | "beta_user" | "manager_pro_gold" | "manager_pro_platinum" | "agent_pro" | null;
  roles?: string[];
  created_at: string;
  updated_at: string;
  last_sign_in: string | null;
  language_preference: string | null;
  manager_id: string | null;
  terms_accepted_at: string | null;
  privacy_settings: {
    show_email: boolean;
    show_phone: boolean;
    show_photo: boolean;
  } | null;
  notification_preferences: {
    email_notifications: boolean;
    phone_notifications: boolean;
  } | null;
  agent_info?: {
    direct_line?: string | null;
    email?: string | null;
    resident_location?: string | null;
    years_of_service_date?: string | null;
    line_authority?: string[] | null; // Changed from string to string[]
    national_producer_number?: string | null;
    resident_license_number?: string | null;
    doj_background_check_date?: string | null;
    live_scan_date?: string | null;
    continuing_education_date?: string | null;
    resident_license_status_date?: string | null;
    resident_license_renewal_date?: string | null;
  } | null;
};
