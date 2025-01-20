export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  role: 'agent' | 'manager' | null;
  privacy_settings: {
    show_email: boolean;
    show_phone: boolean;
    show_photo: boolean;
  };
  notification_preferences: {
    email_notifications: boolean;
    phone_notifications: boolean;
  };
}