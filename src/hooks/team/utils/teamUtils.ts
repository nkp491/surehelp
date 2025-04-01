
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
    
    // Standard approach for all users
    try {
      // First get team_members for this user
      const { data: teamMembers, error: membersError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);
        
      if (membersError) {
        console.error("Error fetching team memberships:", membersError);
        
        // Alternative approach to get team IDs if the first method fails
        console.log("Trying alternative approach to get team IDs...");
        
        // Direct query for teams this user is in
        const { data: directTeams, error: directTeamsError } = await supabase
          .from('teams')
          .select('*')
          .order('name');
          
        if (directTeamsError) {
          console.error("Error in direct teams query:", directTeamsError);
          return []; // Return empty array as fallback
        }
        
        console.log("Direct teams query result:", directTeams);
        return directTeams as Team[];
      }
      
      if (!teamMembers || teamMembers.length === 0) {
        console.log("User has no team memberships");
        return [];
      }
      
      // Get the team IDs
      const teamIds = teamMembers.map(tm => tm.team_id);
      
      // Get the team details
      const { data: teams, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .in('id', teamIds)
        .order('name');
        
      if (teamsError) {
        console.error("Error fetching teams:", teamsError);
        return []; // Return empty array as fallback
      }

      console.log("Teams fetched:", teams?.length || 0);
      return teams as Team[];
    } catch (innerError) {
      console.error("Error in standard team fetch approach:", innerError);
      
      // If standard approach fails, try direct query instead
      const { data: directTeams } = await supabase
        .from('teams')
        .select('*')
        .order('name');
        
      console.log("Direct teams query result as fallback:", directTeams);
      return directTeams as Team[] || [];
    }
  } catch (error) {
    console.error("Error in fetchTeams:", error);
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
