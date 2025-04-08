
import { Profile } from "@/types/profile";

// Extend Profile type to include team_id for team management purposes
export type TeamMemberProfile = Profile & {
  team_id?: string;
};
