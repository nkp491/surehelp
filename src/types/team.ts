export type Team = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type TeamMember = {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  created_at: string;
  updated_at: string;
  // Additional fields from profiles join
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  profile_image_url?: string | null;
  full_name?: string; // Added for convenience
};

export type BulletinReadReceipt = {
  user_id: string;
  user_name?: string;
  user_image?: string;
  read_at: string;
};

export type TeamBulletin = {
  id: string;
  team_id: string;
  created_by: string;
  title: string;
  content: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  category?: string;
  mentioned_users?: string[];
  read_receipts?: BulletinReadReceipt[];
  // Additional fields from profiles join
  author_name?: string;
  author_image?: string;
};

// One-on-One Management Types
export type MeetingStatus = 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';

export type OneOnOneMeeting = {
  id: string;
  team_id: string;
  created_by: string;
  attendee_id: string;
  title: string;
  scheduled_at: string;
  duration_minutes: number;
  location?: string;
  status: MeetingStatus;
  created_at: string;
  updated_at: string;
  // Additional fields from profiles join
  creator_name?: string;
  creator_image?: string;
  attendee_name?: string;
  attendee_image?: string;
};

export type MeetingNote = {
  id: string;
  meeting_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Additional fields from profiles join
  author_name?: string;
};

export type ActionItem = {
  id: string;
  meeting_id: string;
  assigned_to: string;
  description: string;
  due_date?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  // Additional fields from profiles join
  assignee_name?: string;
  assignee_image?: string;
  creator_name?: string;
  meeting_title?: string;
};

export type MeetingFollowup = {
  id: string;
  meeting_id: string;
  reminder_at: string;
  reminder_sent: boolean;
  message?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

// Team Invitation Types
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export type TeamInvitation = {
  id: string;
  team_id: string;
  user_id?: string;
  email?: string;
  invited_by: string;
  role: string;
  status: InvitationStatus;
  token: string;
  expires_at: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  team_name?: string;
  inviter_name?: string;
  inviter_image?: string;
  invitee_name?: string;
  invited_by_name?: string;
  invited_by_profile_image?: string;
  user_name?: string;
};

// Team Relationship Type
export type TeamRelationship = {
  id: string;
  parent_team_id: string;
  child_team_id: string;
  created_at: string;
  updated_at: string;
  // Additional fields from joins
  parent_team_name?: string;
  child_team_name?: string;
};

// Helper type for team member with profile data
export type TeamMemberWithProfile = TeamMember & {
  full_name: string;
  profile_image_url?: string | null;
};
