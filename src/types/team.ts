
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
  // Additional fields from profiles join
  author_name?: string;
  author_image?: string;
};
