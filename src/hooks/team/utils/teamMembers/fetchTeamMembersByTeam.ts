
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";
import { fetchTeamMembersAlternative } from "./fetchTeamMembersAlternative";

/**
 * Fetch team members for a specific team - using a direct approach to avoid RLS recursion
 */
export const fetchTeamMembersByTeam = async (teamId: string): Promise<TeamMember[]> => {
  if (!teamId) return [];
  
  console.log("Fetching team members for team:", teamId);
  
  try {
    // First, try to get all user IDs associated with this team using a direct approach
    // This helps avoid the recursive RLS policy issue
    const { data: teamMemberships, error: membershipError } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('team_id', teamId);
      
    if (membershipError) {
      console.error("Error fetching team memberships:", membershipError);
      
      // If we get an infinite recursion error, try an alternative approach
      if (membershipError.message?.includes('infinite recursion')) {
        console.log("Detected recursion error, trying alternative approach...");
        return await fetchTeamMembersAlternative(teamId);
      }
      
      return [];
    }
    
    if (!teamMemberships || teamMemberships.length === 0) {
      console.log("No team members found for team:", teamId);
      return [];
    }
    
    // Get the user IDs from the memberships
    const userIds = teamMemberships.map(member => member.user_id);
    
    // Fetch profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return [];
    }
    
    // Map the profiles to TeamMember objects
    const result = profiles.map(profile => ({
      id: profile.id,
      user_id: profile.id,
      team_id: teamId,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      profile_image_url: profile.profile_image_url,
      role: profile.role || "",
      created_at: profile.created_at,
      updated_at: profile.updated_at
    })) as TeamMember[];
    
    console.log(`Found ${result.length} members in team:`, teamId);
    return result;
  } catch (error) {
    console.error("Error in fetchTeamMembersByTeam:", error);
    return [];
  }
};
