
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";

/**
 * Fetch team members for a specific manager
 */
export const fetchManagerTeamMembers = async (managerId: string): Promise<TeamMember[]> => {
  if (!managerId) return [];

  console.log("Fetching team members for manager:", managerId);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('manager_id', managerId);

    if (error) {
      console.error("Error fetching team members:", error);
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} team members for manager:`, managerId);
    
    // Transform the data to match our TeamMember type
    return data.map(profile => ({
      id: profile.id,
      user_id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      profile_image_url: profile.profile_image_url,
      team_id: "", // Will be populated from team_members table if needed
      role: profile.role || "",
      created_at: profile.created_at,
      updated_at: profile.updated_at
    })) as TeamMember[];
  } catch (error) {
    console.error("Error in fetchManagerTeamMembers:", error);
    return [];
  }
};
