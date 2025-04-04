
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches user's teams directly using security definer functions
 * to avoid RLS recursion issues
 */
export const fetchUserTeamsDirectly = async () => {
  console.log("Fetching user teams directly");
  
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    
    // Use the secure function to get team IDs
    const { data: secureTeams, error: secureError } = await supabase.rpc(
      'get_user_teams_by_id',
      { user_id_param: user.id }
    );
    
    if (!secureError && secureTeams && Array.isArray(secureTeams) && secureTeams.length > 0) {
      console.log("Got user teams via secure function:", secureTeams);
      // Now fetch full team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', secureTeams);
        
      if (!teamsError && teams) {
        return teams;
      }
    }
    
    // Fall back to direct query if the secure function fails
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, teams:team_id(id, name, created_at)')
      .eq('user_id', user.id);
      
    if (error) {
      console.error("Error fetching user teams directly:", error);
      throw error;
    }
    
    return data?.map(item => item.teams) || [];
  } catch (error) {
    console.error("Error in fetchUserTeamsDirectly:", error);
    return [];
  }
};

/**
 * Fetch teams through the user's manager using security definer function
 */
export const fetchTeamsThroughManager = async (managerId: string) => {
  console.log("Fetching teams through manager:", managerId);
  
  try {
    // Try to use the secure function
    const { data: managerTeams, error: rpcError } = await supabase.rpc(
      'get_user_teams_by_id',
      { user_id_param: managerId }
    );
    
    if (!rpcError && managerTeams && Array.isArray(managerTeams) && managerTeams.length > 0) {
      console.log("Got manager teams via secure function:", managerTeams);
      
      // Now fetch full team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', managerTeams);
        
      if (!teamsError && teams) {
        return teams;
      }
    }
    
    // Fall back to direct query through the join tables
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, teams:team_id(id, name, created_at)')
      .eq('user_id', managerId);
      
    if (error) {
      console.error("Error fetching through manager:", error);
      throw error;
    }
    
    return data?.map(item => item.teams) || [];
  } catch (error) {
    console.error("Error in fetchTeamsThroughManager:", error);
    return [];
  }
};

/**
 * Fetch teams without relying on RLS using security definer functions
 */
export const fetchTeamsWithoutRLS = async (userId: string) => {
  console.log("Attempting to fetch teams without RLS");
  
  try {
    // First try the secure function
    const { data: secureTeams, error: secureError } = await supabase.rpc(
      'get_user_teams_by_id',
      { user_id_param: userId }
    );
    
    if (!secureError && secureTeams && Array.isArray(secureTeams) && secureTeams.length > 0) {
      console.log("Got user teams via secure function:", secureTeams);
      
      // Now fetch full team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', secureTeams);
        
      if (!teamsError && teams) {
        return teams;
      }
    }
    
    // If that fails, try a different approach
    console.log("Secure function failed, trying alternative approach");
    
    // Fall back to the RPC that doesn't require parameters
    const { data: userTeams, error: rpcError } = await supabase.rpc(
      'get_user_team_memberships',
      { user_id_param: userId }
    );
    
    if (!rpcError && userTeams && Array.isArray(userTeams) && userTeams.length > 0) {
      console.log("Got team IDs via RPC:", userTeams);
      
      // Fetch team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', userTeams);
        
      if (!teamsError && teams) {
        return teams;
      }
    }
    
    return [];
  } catch (error) {
    console.error("Error in fetchTeamsWithoutRLS:", error);
    return [];
  }
};
