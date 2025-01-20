export type UserRole = 'agent' | 'manager';

export interface TeamInvitation {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_id: string;
  status: 'pending' | 'accepted' | 'declined' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  user_id: string;
  role: UserRole;
  profile: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  metrics?: {
    leads: number;
    calls: number;
    contacts: number;
    scheduled: number;
    sits: number;
    sales: number;
    ap: number;
  };
}