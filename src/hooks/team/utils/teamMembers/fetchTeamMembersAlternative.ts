
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";

/**
 * Alternative method to fetch team members when RLS recursion issues occur
 * Uses a general approach without special case handling for specific users
 */
export const fetchTeamMembersAlternative = async (teamId: string): Promise<TeamMember[]> => {
  console.log("Using alternative team members fetch method for team:", teamId);
  
  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // Use our secure database function to check if the user is in this team
    const { data: isInTeam } = await supabase.rpc(
      'is_team_member',
      { team_id: teamId }
    );
    
    if (!isInTeam) {
      console.log("User is not a member of this team");
      return [];
    }
    
    // First try to get team managers (usually fewer records, so more efficient)
    const { data: teamManagers } = await supabase
      .from('team_managers')
      .select('user_id,role')
      .eq('team_id', teamId);
      
    // Then get profiles for all team members with a single query approach
    const { data: teamMemberProfiles } = await supabase
      .from('profiles')
      .select(`
        id,
        first_name,
        last_name,
        email,
        profile_image_url,
        created_at,
        updated_at,
        role
      `)
      .in('id', (await supabase
        .from('team_members')
        .select('user_id')
        .eq('team_id', teamId)).data?.map(m => m.user_id) || []);
    
    if (!teamMemberProfiles || teamMemberProfiles.length === 0) {
      console.log("No team member profiles found");
      return [];
    }
    
    // Create the TeamMember objects with the profile information
    const result = teamMemberProfiles.map(profile => {
      const manager = teamManagers?.find(m => m.user_id === profile.id);
      return {
        id: profile.id,
        user_id: profile.id,
        team_id: teamId,
        first_name: profile.first_name,
        last_name: profile.last_name,
        email: profile.email,
        profile_image_url: profile.profile_image_url,
        // Use manager role if present, otherwise use profile role or default to "agent"
        role: manager?.role || profile.role || "agent",
        created_at: profile.created_at,
        updated_at: profile.updated_at
      };
    }) as TeamMember[];
    
    console.log(`Found ${result.length} members in team:`, teamId);
    return result;
  } catch (error) {
    console.error("Error in fetchTeamMembersAlternative:", error);
    return [];
  }
};
