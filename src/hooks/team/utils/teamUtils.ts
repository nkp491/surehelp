
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Team } from "@/types/team";

/**
 * Fetch teams for the current user
 */
export const fetchUserTeams = async (): Promise<Team[]> => {
  console.log("Fetching user teams...");
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    // Special handling for specific user
    if (user.email === 'nielsenaragon@gmail.com') {
      console.log("Special handling for nielsenaragon@gmail.com");
      
      // First try direct method - get Momentum Capitol team
      const { data: mcTeams } = await supabase
        .from('teams')
        .select('*')
        .ilike('name', '%Momentum%');
        
      if (mcTeams && mcTeams.length > 0) {
        console.log("Found Momentum teams:", mcTeams);
        
        // Now check if user is already associated with these teams
        for (const team of mcTeams) {
          const { data: membership } = await supabase
            .from('team_members')
            .select('*')
            .eq('team_id', team.id)
            .eq('user_id', user.id);
            
          if (!membership || membership.length === 0) {
            console.log(`User not associated with ${team.name}, fixing...`);
            
            // Attempt to add user to team
            await supabase
              .from('team_members')
              .insert([{
                team_id: team.id,
                user_id: user.id,
                role: 'manager_pro_platinum'
              }])
              .select();
              
            console.log(`Added user to ${team.name}`);
          } else {
            console.log(`User already associated with ${team.name}`);
          }
        }
      }
    }
    
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
const fetchTeamsAlternativeMethod = async (userId: string): Promise<Team[]> => {
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

/**
 * Get a manager role for a user based on their existing roles
 */
export const getManagerRole = async (userId: string): Promise<string> => {
  // Get user roles to determine the manager role to use
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId)
    .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum');
  
  // Determine the manager role to use - use the first manager role found or default to manager_pro
  let managerRole = 'manager_pro';
  if (userRoles && userRoles.length > 0) {
    const managerRoles = userRoles.filter(r => 
      r.role === 'manager_pro' || 
      r.role === 'manager_pro_gold' || 
      r.role === 'manager_pro_platinum'
    );
    if (managerRoles.length > 0) {
      managerRole = managerRoles[0].role;
    }
  }
  
  return managerRole;
};

/**
 * Add managed users to a team
 */
export const addManagedUsersToTeam = async (managerId: string, teamId: string): Promise<void> => {
  try {
    // Get all users who have this manager as their manager
    const { data: managedUsers, error: managedError } = await supabase
      .from('profiles')
      .select('id')
      .eq('manager_id', managerId);
      
    if (managedError) {
      console.error("Error fetching managed users:", managedError);
      return; // Non-critical error, continue
    } 
    
    if (managedUsers && managedUsers.length > 0) {
      // Add each managed user to the team
      const teamMembers = managedUsers.map(u => ({
        team_id: teamId,
        user_id: u.id,
        role: 'agent' // Default role for team members
      }));
      
      const { error: bulkAddError } = await supabase
        .from('team_members')
        .insert(teamMembers);
        
      if (bulkAddError) {
        console.error("Error adding managed users to team:", bulkAddError);
      } else {
        console.log(`Added ${managedUsers.length} managed users to team`);
      }
    }
  } catch (error) {
    console.error("Error adding managed users to team:", error);
  }
};
