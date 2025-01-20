export type UserRole = 'agent' | 'manager';
export type TeamRole = 'manager' | 'member';
export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'cancelled';

export interface TeamInvitation {
  id: string;
  team_id: string;
  inviter_id: string;
  invitee_id: string;
  status: InvitationStatus;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
  created_at: string;
  updated_at: string;
  profile?: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  };
  metrics?: {
    leads: number | null;
    calls: number | null;
    contacts: number | null;
    scheduled: number | null;
    sits: number | null;
    sales: number | null;
    ap: number | null;
  };
}