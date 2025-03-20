
export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export type NotificationCategory = 
  | 'team' 
  | 'system' 
  | 'meeting' 
  | 'performance' 
  | 'role' 
  | 'message'
  | 'other';

export interface NotificationPreferences {
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
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  content: string;
  link?: string;
  channel_id?: string;
  is_read: boolean;
  created_at: string;
  sent_at?: string;
  read_at?: string;
  expires_at?: string;
  priority: NotificationPriority;
  category?: NotificationCategory;
  source?: string;
  metadata?: Record<string, any>;
}

export interface NotificationChannel {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
