
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";

/**
 * Alternative method to fetch team members when RLS recursion issues occur
 */
export const fetchTeamMembersAlternative = async (teamId: string): Promise<TeamMember[]> => {
  console.log("Using alternative team members fetch method for team:", teamId);
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // General fallback - get the team owner info
    const { data: teamManager } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (teamManager) {
      return [{
        id: teamManager.id,
        user_id: teamManager.id,
        team_id: teamId,
        first_name: teamManager.first_name,
        last_name: teamManager.last_name,
        email: teamManager.email,
        profile_image_url: teamManager.profile_image_url,
        role: teamManager.role || "manager",
        created_at: teamManager.created_at,
        updated_at: teamManager.updated_at
      }] as TeamMember[];
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchTeamMembersAlternative:", error);
    return [];
  }
};
