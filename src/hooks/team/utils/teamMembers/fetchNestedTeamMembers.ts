
import { supabase } from "@/integrations/supabase/client";
import { TeamMember } from "@/types/team";

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
