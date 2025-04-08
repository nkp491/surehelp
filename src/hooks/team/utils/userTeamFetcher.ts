
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";

/**
 * Utility function to fetch teams for a user
 */
export const fetchUserTeams = async (): Promise<Team[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log("Fetching teams for user:", user.id);
    
    // Get user profile to check for manager_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('manager_id')
      .eq('id', user.id)
      .single();
      
    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }
    
    // Get direct team memberships
    const { data: teamMemberships, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);
      
    if (membershipError) {
      console.error("Error fetching team memberships:", membershipError);
      return [];
    }
    
    if (!teamMemberships || teamMemberships.length === 0) {
      console.log("No direct team memberships found for user");
      
      // Special case check
      if (user.email === 'nielsenaragon@gmail.com') {
        const { data: momentumTeams } = await supabase
          .from('teams')
          .select('*')
          .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
        
        console.log("Found Momentum teams for special case:", momentumTeams);
        return momentumTeams || [];
      }
      
      // Try fetching through manager if available
      const managerId = profile?.manager_id;
      if (managerId) {
        console.log("Trying to fetch teams through manager:", managerId);
        
        const { data: managerTeams, error } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', managerId);
          
        if (error || !managerTeams || managerTeams.length === 0) {
          console.log("Manager has no teams or error fetching manager teams");
          return [];
        }
        
        const teamIds = managerTeams.map(tm => tm.team_id);
        
        const { data: teams } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .order('name');
          
        console.log("Found teams through manager:", teams?.length || 0);
        return teams || [];
      }
      
      return [];
    }
    
    // Get the actual teams
    const teamIds = teamMemberships.map(tm => tm.team_id);
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .order('name');
      
    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      return [];
    }
    
    console.log("Found teams:", teams?.length || 0);
    return teams || [];
  } catch (error) {
    console.error("Error in fetchUserTeams:", error);
    return [];
  }
};
