
export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  role: "agent" | "manager_pro" | "beta_user" | "manager_pro_gold" | "manager_pro_platinum" | "agent_pro" | null;
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
    phone_notifications: boolean;
  } | null;
};
