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

interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
}

export interface TeamMembers {
  id: string;
  team_id: string;
  user_id: string;
  role: string;
  profiles: Profile;
}

export interface Teams {
  id: string;
  name: string;
  performance: number;
  team_members: TeamMember[];
}

// This is the transformed data structure after mapping
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
