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
  roles?: string[];
  name?: string;
  created_at: string;
  updated_at: string;
  first_name?: string | null;
  last_name?: string | null;
  email?: string | null;
  profile_image_url?: string | null;
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
  author_name?: string;
  author_image?: string;
};

export interface TransformedTeam {
  id: string;
  name: string;
  performance?: number;
  members: {
    id: string;
    team_id: string;
    user_id: string;
    role: string;
    name: string;
    email?: string;
    profile_image_url?: string | null;
  }[];
}

export interface TeamBulletins {
  title: string;
  content: string;
  created_at: string;
}

export interface TeamBulletInsProps {
  bulletins: TeamBulletins[];
  loading?: boolean;
}

export interface TeamListProps {
  teams: TransformedTeam[];
  setSelectedTeam: (team: TransformedTeam | null) => void;
  loading: boolean;
}

export interface DailyMetric {
  user_id: string;
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
  created_at: string;
}

export interface Meeting {
  id: string;
  created_by: string;
  created_at: string;
}

export interface MeetingNote {
  id: string;
  meeting_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  profile_image_url?: string | null;
}

export interface RawMetrics {
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
}

export interface MetricRatios {
  leadsToContact: string;
  leadsToScheduled: string;
  leadsToSits: string;
  leadsToSales: string;
  callsToContact: string;
  callsToScheduled: string;
  callsToSits: string;
  callsToSales: string;
  aPPerCall: string;
  contactToScheduled: string;
  contactToSits: string;
  contactToSales: string;
  aPPerContact: string;
  aPPerLead: string;
  scheduledToSits: string;
  scheduledToSales: string;
  sitsToSalesCloseRatio: string;
  aPPerSit: string;
  aPPerAppointment: string;
  aPPerSale: string;
}

export interface MemberMetrics extends RawMetrics {
  conversion: number;
  ratios: MetricRatios;
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
}

export interface EnrichedMember {
  user_id: string;
  name: string;
  role: string;
  roles?: string[];
  email?: string; // Make email optional
  profile_image_url?: string | null;
  metrics: MemberMetrics;
  notes: MeetingNote[];
}

export interface ProfileInfo {
  name: string;
  email: string;
  profile_image_url: string | null;
}
