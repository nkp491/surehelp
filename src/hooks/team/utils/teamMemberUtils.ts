
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

/**
 * Fetch team members for a specific team
 */
export const fetchTeamMembersByTeam = async (teamId: string): Promise<TeamMember[]> => {
  try {
    console.log("Fetching team members for team:", teamId);
    
    // First get the team members from the team_members table
    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);
      
    if (teamMembersError) {
      console.error("Error fetching team members:", teamMembersError);
      return [];
    }
    
    if (!teamMembersData || teamMembersData.length === 0) {
      console.log("No team members found for team:", teamId);
      return [];
    }
    
    // Get the user IDs from the team members
    const userIds = teamMembersData.map(member => member.user_id);
    
    // Fetch the profile information for those users
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);
      
    if (profilesError) {
      console.error("Error fetching profiles:", profilesError);
      return [];
    }
    
    // Combine the team members data with the profiles data
    const result = teamMembersData.map(member => {
      const profile = profilesData?.find(p => p.id === member.user_id);
      return {
        id: member.id,
        team_id: member.team_id,
        user_id: member.user_id,
        role: member.role,
        created_at: member.created_at,
        updated_at: member.updated_at,
        // Add profile information if available
        first_name: profile?.first_name || null,
        last_name: profile?.last_name || null,
        email: profile?.email || null,
        profile_image_url: profile?.profile_image_url || null
      };
    }) as TeamMember[];
    
    console.log(`Found ${result.length} members in team:`, teamId);
    return result;
  } catch (error) {
    console.error("Error in fetchTeamMembersByTeam:", error);
    return [];
  }
};

/**
 * Fetch nested team members (team members under managers that have this manager as their manager)
 */
export const fetchNestedTeamMembers = async (managerId: string): Promise<TeamMember[]> => {
  if (!managerId) return [];
  
  try {
    // First get managers who have this manager as their manager
    const { data: subManagers, error: subManagerError } = await supabase
      .from('profiles')
      .select('*')
      .eq('manager_id', managerId)
      .or(`role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum`);
      
    if (subManagerError) {
      console.error("Error fetching sub-managers:", subManagerError);
      return [];
    }
    
    if (!subManagers || subManagers.length === 0) return [];
    
    console.log(`Found ${subManagers.length} sub-managers for manager:`, managerId);
    
    // Get the IDs of all sub-managers
    const subManagerIds = subManagers.map(manager => manager.id);
    
    // Now get all team members who have any of these sub-managers as their manager
    const { data: nestedMembers, error: membersError } = await supabase
      .from('profiles')
      .select('*')
      .in('manager_id', subManagerIds);
      
    if (membersError) {
      console.error("Error fetching nested team members:", membersError);
      return [];
    }
    
    console.log(`Found ${nestedMembers?.length || 0} nested team members for sub-managers`);
    
    // Transform the data to match our TeamMember type for consistency
    return nestedMembers.map(profile => ({
      id: profile.id,
      user_id: profile.id,
      first_name: profile.first_name,
      last_name: profile.last_name,
      email: profile.email,
      profile_image_url: profile.profile_image_url,
      team_id: "", // This would need to be joined from team_members table
      role: profile.role || "",
      created_at: profile.created_at,
      updated_at: profile.updated_at
    })) as TeamMember[];
  } catch (error) {
    console.error("Error in fetchNestedTeamMembers:", error);
    return [];
  }
};
