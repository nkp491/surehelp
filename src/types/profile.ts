export type Profile = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  profile_image_url: string | null;
  role?: string | null;
  roles: string[];
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
};

export const isManager = (profile: Profile | null) => {
  return profile?.roles?.some(role => 
    ['manager_pro', 'manager_pro_gold', 'manager_pro_platinum'].includes(role)
  ) || profile?.role?.includes('manager_pro');
};

export const getManagerId = (profile: Profile | null) => {
  return profile?.manager_id || null;
};
