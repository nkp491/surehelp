
import { supabase } from "@/integrations/supabase/client";

type CheckTeamAssociationFn = (managerId: string) => Promise<boolean>;

export const useAgentTeamAssociation = (
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  checkAndUpdateTeamAssociation: CheckTeamAssociationFn
) => {
  /**
   * Advanced fix for agent team associations
   */
  const forceAgentTeamAssociation = async () => {
    setIsProcessing(true);
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Get user's profile to check manager
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manager_id, role')
        .eq('id', user.id)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        return false;
      }
        
      if (!profile || !profile.manager_id) {
        console.log("User has no manager assigned");
        return false;
      }
      
      // Check if user has agent role
      const isAgent = profile.role?.includes('agent') || await checkAgentRole(user.id);
      
      if (!isAgent) {
        console.log("User is not an agent");
        return false;
      }
      
      // Call the function to associate with manager's teams
      const result = await checkAndUpdateTeamAssociation(profile.manager_id);
      
      // If manager has no teams, create a default team for them
      if (!result) {
        console.log("Manager has no teams, attempting to create a default team");
        const managerTeams = await ensureManagerHasTeam(profile.manager_id);
        if (managerTeams && managerTeams.length > 0) {
          // Try association again with the newly created team
          console.log("Manager now has a team, trying to associate again");
          return await checkAndUpdateTeamAssociation(profile.manager_id);
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error in forceAgentTeamAssociation:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Check if user has agent role
   */
  const checkAgentRole = async (userId: string) => {
    try {
      const { data: roles, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
        
      if (error) {
        console.error("Error checking agent role:", error);
        return false;
      }
        
      return roles?.some(r => r.role === 'agent' || r.role === 'agent_pro') || false;
    } catch (error) {
      console.error("Error checking agent role:", error);
      return false;
    }
  };

  /**
   * Ensure manager has at least one team
   */
  const ensureManagerHasTeam = async (managerId: string) => {
    try {
      // Check if manager has any teams
      const { data: existingTeams, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', managerId);
        
      if (teamError) {
        console.error("Error checking manager teams:", teamError);
        return null;
      }
        
      if (existingTeams && existingTeams.length > 0) {
        return existingTeams;
      }
      
      // Get manager profile for team name
      const { data: managerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', managerId)
        .maybeSingle();
        
      if (profileError) {
        console.error("Error fetching manager profile:", profileError);
        return null;
      }
        
      if (!managerProfile) {
        console.log("Manager profile not found");
        return null;
      }
      
      // Create a default team for the manager
      const teamName = `${managerProfile.first_name || 'Manager'}'s Team`;
      
      // Create team
      const { data: newTeam, error: createError } = await supabase
        .from('teams')
        .insert([{ name: teamName }])
        .select()
        .single();
        
      if (createError || !newTeam) {
        console.error("Error creating team for manager:", createError);
        return null;
      }
      
      // Add manager to the team
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{ 
          team_id: newTeam.id,
          user_id: managerId,
          role: 'manager_pro'
        }]);
        
      if (memberError) {
        console.error("Error adding manager to team:", memberError);
      }
      
      // Find and add all managed users to the team
      const { data: managedUsers, error: managedError } = await supabase
        .from('profiles')
        .select('id')
        .eq('manager_id', managerId);
      
      if (!managedError && managedUsers && managedUsers.length > 0) {
        const teamMembers = managedUsers.map(u => ({
          team_id: newTeam.id,
          user_id: u.id,
          role: 'agent'
        }));
        
        const { error: bulkAddError } = await supabase
          .from('team_members')
          .insert(teamMembers);
          
        if (bulkAddError) {
          console.error("Error adding managed users to team:", bulkAddError);
        } else {
          console.log(`Added ${managedUsers.length} managed users to new team ${newTeam.id}`);
        }
      }
      
      return [{ team_id: newTeam.id }];
    } catch (error) {
      console.error("Error ensuring manager has team:", error);
      return null;
    }
  };

  return {
    forceAgentTeamAssociation
  };
};
