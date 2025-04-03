
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";

/**
 * Fetch teams for a user through their team memberships
 */
export const fetchUserTeamsDirectly = async (): Promise<Team[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    console.log("Fetching teams directly for user:", user.id);
    
    // Get the team memberships
    const { data: teamMemberships, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);
      
    if (membershipError) {
      console.error("Error fetching team memberships:", membershipError);
      throw membershipError;
    }
    
    if (!teamMemberships || teamMemberships.length === 0) {
      console.log("No direct team memberships found for user");
      return [];
    }
    
    const teamIds = teamMemberships.map(tm => tm.team_id);
    console.log("Found team IDs:", teamIds);
    
    // Get the team details
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .order('name');
      
    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      throw teamsError;
    }
    
    console.log("Found teams:", teams?.length || 0, teams);
    return teams || [];
  } catch (error) {
    console.error("Error in fetchUserTeamsDirectly:", error);
    throw error;
  }
};

/**
 * Fetch Momentum teams for special cases
 */
export const fetchMomentumTeams = async (): Promise<Team[]> => {
  console.log("Fetching Momentum teams");
  
  const { data: momentumTeams } = await supabase
    .from('teams')
    .select('*')
    .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
    
  console.log("Found Momentum teams:", momentumTeams);
  return momentumTeams || [];
};

/**
 * Fetch teams through a manager's team memberships
 */
export const fetchTeamsThroughManager = async (managerId: string): Promise<Team[]> => {
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
  
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('*')
    .in('id', teamIds)
    .order('name');
    
  if (teamsError) {
    console.error("Error fetching teams through manager:", teamsError);
    return [];
  }
  
  console.log("Found teams through manager:", teams?.length || 0);
  return teams || [];
};

/**
 * Check if a user is a special case that needs custom team handling
 */
export const checkSpecialUserCase = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user?.email === 'nielsenaragon@gmail.com';
  } catch (error) {
    return false;
  }
};
