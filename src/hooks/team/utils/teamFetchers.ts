
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";
import { useToast } from "@/hooks/use-toast";

/**
 * Fetch teams directly for the current user
 */
export const fetchUserTeamsDirectly = async (): Promise<Team[]> => {
  try {
    console.log("Fetching user teams directly...");
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    try {
      // Try to get team memberships first
      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);
        
      if (membershipError) {
        console.error("Error fetching team memberships:", membershipError);
        
        if (membershipError.message?.includes('infinite recursion')) {
          // Try the second approach that doesn't rely on RLS
          return await fetchTeamsWithoutRLS(user.id);
        }
        
        return [];
      }
      
      if (!memberships || memberships.length === 0) {
        console.log("No team memberships found");
        return [];
      }
      
      // Get the team IDs
      const teamIds = memberships.map(m => m.team_id);
      
      // Get team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds);
        
      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        return [];
      }
      
      console.log(`Found ${teams?.length || 0} teams for user`);
      return teams as Team[];
    } catch (error) {
      console.error("Error in fetchUserTeamsDirectly:", error);
      return await fetchTeamsWithoutRLS(user.id);
    }
  } catch (error) {
    console.error("Error in fetchUserTeamsDirectly:", error);
    return [];
  }
};

/**
 * Fetch teams without relying on RLS (for when RLS causes infinite recursion)
 */
export const fetchTeamsWithoutRLS = async (userId: string): Promise<Team[]> => {
  console.log("Attempting to fetch teams without RLS for user:", userId);
  
  try {
    // First get all teams (this query should not use RLS)
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
      
    if (teamsError) {
      console.error("Error fetching all teams:", teamsError);
      return [];
    }
    
    // Then get this user's team memberships directly
    try {
      // Try direct query without RPC
      const { data: memberships, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', userId);
      
      if (!membershipError && memberships && Array.isArray(memberships) && memberships.length > 0) {
        console.log("Successfully fetched user teams directly");
        // Extract team IDs
        const teamIds = memberships.map(item => item.team_id);
        // Filter teams by IDs
        return allTeams.filter((team: Team) => teamIds.includes(team.id));
      } else if (membershipError) {
        console.error("Error fetching team memberships:", membershipError);
      }
    } catch (directError) {
      console.log("Direct function call failed, trying fallback:", directError);
    }
    
    // Fallback to direct SQL if previous method not available
    // This is a simplified approach - we fetch all team_members and filter client-side
    const { data: allMemberships, error: membershipsError } = await supabase
      .from('team_members')
      .select('team_id, user_id');
      
    if (membershipsError) {
      console.error("Error fetching all memberships:", membershipsError);
      return [];
    }
    
    // Filter memberships for this user
    const userMemberships = allMemberships.filter(m => m.user_id === userId);
    if (userMemberships.length === 0) {
      console.log("No team memberships found for user");
      return [];
    }
    
    // Get the team IDs
    const teamIds = userMemberships.map(m => m.team_id);
    
    // Filter the teams
    const userTeams = allTeams.filter((team: Team) => teamIds.includes(team.id));
    
    console.log(`Found ${userTeams.length} teams for user through fallback method`);
    return userTeams;
  } catch (error) {
    console.error("Error in fetchTeamsWithoutRLS:", error);
    return [];
  }
};

/**
 * Checks if this is a special user case that needs custom handling
 */
export const checkSpecialUserCase = async (): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  // Check if this is the special case user
  return user.email === 'nielsenaragon@gmail.com' || 
         user.email === 'nielsenaragon@ymail.com';
};

/**
 * Fetch Momentum teams for the special user case
 */
export const fetchMomentumTeams = async (): Promise<Team[]> => {
  try {
    console.log("Fetching Momentum teams for special user case");
    
    const { data: allTeams, error: teamsError } = await supabase
      .from('teams')
      .select('*');
      
    if (teamsError) {
      console.error("Error fetching all teams:", teamsError);
      return [];
    }
    
    // Filter for Momentum teams
    const momentumTeams = allTeams.filter((team: Team) => 
      team.name.includes('Momentum Capitol') || 
      team.name.includes('Momentum Capital')
    );
    
    console.log("Special case: Found Momentum teams:", momentumTeams);
    
    // If not found, create the team as a fallback
    if (momentumTeams.length === 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        
        // Create new Momentum Capitol team
        const { data: newTeam, error: createError } = await supabase
          .from('teams')
          .insert([{ name: 'Momentum Capitol Team' }])
          .select()
          .single();
          
        if (createError) {
          console.error("Error creating Momentum team:", createError);
          return [];
        }
        
        // Add user to the new team
        await supabase
          .from('team_members')
          .insert([{
            team_id: newTeam.id,
            user_id: user.id,
            role: 'manager_pro_platinum'
          }]);
          
        console.log("Created new Momentum team for special user");
        return [newTeam];
      } catch (createError) {
        console.error("Error in Momentum team fallback creation:", createError);
        return [];
      }
    }
    
    return momentumTeams;
  } catch (error) {
    console.error("Error in fetchMomentumTeams:", error);
    return [];
  }
};

/**
 * Fetch teams through the user's manager
 */
export const fetchTeamsThroughManager = async (managerId: string): Promise<Team[]> => {
  try {
    console.log("Fetching teams through manager:", managerId);
    
    // Get manager's team memberships
    const { data: managerTeams, error: managerError } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', managerId);
      
    if (managerError || !managerTeams || managerTeams.length === 0) {
      console.log("Manager has no teams or error fetching manager teams");
      return [];
    }
    
    // Get the team IDs
    const teamIds = managerTeams.map(m => m.team_id);
    
    // Get team details
    const { data: teams, error: teamsError } = await supabase
      .from('teams')
      .select('*')
      .in('id', teamIds);
      
    if (teamsError) {
      console.error("Error fetching manager's teams:", teamsError);
      return [];
    }
    
    console.log(`Found ${teams?.length || 0} teams through manager`);
    return teams as Team[];
  } catch (error) {
    console.error("Error in fetchTeamsThroughManager:", error);
    return [];
  }
};
