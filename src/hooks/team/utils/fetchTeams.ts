
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";

/**
 * Fetch teams for the current user
 */
export const fetchUserTeams = async (): Promise<Team[]> => {
  console.log("Fetching user teams...");
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Standard approach for all users - first get team memberships
    const { data: teamMembers, error: membersError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);
      
    if (membersError) {
      console.error("Error fetching team memberships:", membersError);
      return fetchTeamsAlternativeMethod(user.id);
    }
    
    if (!teamMembers || teamMembers.length === 0) {
      console.log("User has no team memberships");
      return [];
    }
    
    // Get the team IDs
    const teamIds = teamMembers.map(tm => tm.team_id);
    console.log("Team IDs found:", teamIds);
    
    // Get the team details
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds)
      .order('name');
      
    if (teamsError) {
      console.error("Error fetching teams:", teamsError);
      return fetchTeamsAlternativeMethod(user.id);
    }

    console.log("Teams fetched:", teams?.length || 0);
    return teams as Team[];
  } catch (error) {
    console.error("Error in fetchTeams:", error);
    return [];
  }
};

/**
 * Alternative method to fetch teams when the standard approach fails
 */
export const fetchTeamsAlternativeMethod = async (userId: string): Promise<Team[]> => {
  console.log("Using alternative method to fetch teams for user:", userId);
  
  try {
    // Try to query all teams
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .order('name');
      
    if (teamsError) {
      console.error("Error fetching all teams:", teamsError);
      return [];
    }
    
    // Query team_members in a separate call
    const { data: memberships, error: membershipError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId);
      
    if (membershipError) {
      console.error("Error fetching team memberships:", membershipError);
      return [];
    }
    
    if (!memberships || memberships.length === 0) {
      console.log("No team memberships found for user");
      return [];
    }
    
    // Filter the teams based on memberships
    const teamIds = memberships.map(m => m.team_id);
    const userTeams = allTeams.filter(team => teamIds.includes(team.id));
    
    console.log("Alternative method found teams:", userTeams.length);
    return userTeams;
  } catch (error) {
    console.error("Error in alternative teams query:", error);
    return [];
  }
};
