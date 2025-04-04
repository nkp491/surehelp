
import { supabase } from "@/integrations/supabase/client";

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
