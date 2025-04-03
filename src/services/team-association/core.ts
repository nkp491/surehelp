import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useTeamAssociationCore = (
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Check and update team associations for an agent with their manager's teams
   */
  const checkAndUpdateTeamAssociation = async (managerId: string) => {
    if (!managerId) return false;
    
    setIsProcessing(true);
    try {
      console.log("Checking team associations for manager:", managerId);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }
      
      // Try using direct database operations instead of RPC
      try {
        const { data: result, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', user.id)
          .eq('manager_id', managerId)
          .single();
          
        if (profileError) {
          console.error("Error checking profile:", profileError);
        } else if (result) {
          // Manual ensure_user_in_manager_teams logic
          console.log("Manually checking and adding user to manager teams");
          
          // Get manager's teams
          const { data: managerTeams, error: teamsError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', managerId);
            
          if (teamsError) {
            console.error("Error getting manager teams:", teamsError);
          } else if (managerTeams && managerTeams.length > 0) {
            let addedToAnyTeam = false;
            
            // For each team, add the user if not already a member
            for (const team of managerTeams) {
              // Check if already a member
              const { data: existingMembership } = await supabase
                .from('team_members')
                .select('id')
                .eq('team_id', team.team_id)
                .eq('user_id', user.id)
                .maybeSingle();
                
              if (!existingMembership) {
                // Add user to team
                const { error: insertError } = await supabase
                  .from('team_members')
                  .insert([{
                    team_id: team.team_id,
                    user_id: user.id,
                    role: 'agent'
                  }]);
                  
                if (!insertError) {
                  addedToAnyTeam = true;
                  console.log(`Added user to team ${team.team_id}`);
                }
              }
            }
            
            // Refresh team data in the UI if changes were made
            if (addedToAnyTeam) {
              // Refresh all team-related queries
              queryClient.invalidateQueries({ queryKey: ['user-teams'] });
              queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
              queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
              
              toast({
                title: "Teams Updated",
                description: "You've been added to your manager's teams.",
              });
              
              return true;
            } else {
              console.log("User was already in all teams");
              return true; // Still return true if user is properly associated
            }
          }
        }
        
        // If the direct approach failed, try the fallback approach
        return await addUserToTeamsByManager(user.id, managerId);
      } catch (funcError) {
        console.error("Error with direct approach:", funcError);
        // Try the manual approach as fallback
        return await addUserToTeamsByManager(user.id, managerId);
      }
    } catch (error) {
      console.error("Error updating team associations:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Process team associations for a user with given teams
   */
  const processTeamAssociations = async (userId: string, teamData: any[]) => {
    let teamsAddedCount = 0;
    
    for (const teamMembership of teamData) {
      const { data: existingMembership, error: membershipError } = await supabase
        .from('team_members')
        .select('id')
        .eq('team_id', teamMembership.team_id)
        .eq('user_id', userId)
        .maybeSingle();
        
      if (membershipError) {
        console.error(`Error checking existing membership for team ${teamMembership.team_id}:`, membershipError);
        continue; // Skip this team and try the next one
      }
        
      if (!existingMembership) {
        // Add user to team with agent role
        const { error: addError } = await supabase
          .from('team_members')
          .insert([{ 
            team_id: teamMembership.team_id,
            user_id: userId,
            role: 'agent'
          }]);
          
        if (!addError) {
          teamsAddedCount++;
          console.log(`Successfully added user to team ${teamMembership.team_id}`);
        } else {
          console.error(`Error adding to team ${teamMembership.team_id}:`, addError);
        }
      } else {
        console.log(`User already in team ${teamMembership.team_id}`);
      }
    }
    
    // Refresh team data in the UI
    queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
    queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
    
    if (teamsAddedCount > 0) {
      toast({
        title: "Teams Updated",
        description: `You've been added to ${teamsAddedCount} of your manager's teams.`,
      });
      return true;
    } else {
      console.log("No new teams to add");
      return teamData.length > 0; // Return true if the manager has teams, even if user was already in all of them
    }
  };

  /**
   * Alternative method to add a user to their manager's teams
   */
  const addUserToTeamsByManager = async (userId: string, managerId: string) => {
    try {
      // Get manager's team memberships directly
      const { data: managerTeamMembers, error: managerTeamsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', managerId);
      
      if (managerTeamsError) {
        console.log("Direct query error:", managerTeamsError);
        console.log("Falling back to standard query");
        
        // Fallback to standard query if direct query fails
        const { data: teamData, error: teamsError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', managerId);
          
        if (teamsError) {
          console.error("Error fetching manager's teams:", teamsError);
          // Try alternative method
          return await addUserToManagerTeamsAlternative(userId, managerId);
        }
        
        if (!teamData || teamData.length === 0) {
          console.log("Manager has no teams");
          return false;
        }
        
        return await processTeamAssociations(userId, teamData);
      }
      
      if (!managerTeamMembers || !Array.isArray(managerTeamMembers) || managerTeamMembers.length === 0) {
        console.log("Manager has no teams (from direct query)");
        return false;
      }
      
      return await processTeamAssociations(userId, managerTeamMembers);
    } catch (error) {
      console.error("Error in team association process:", error);
      return false;
    }
  };

  /**
   * Alternative method with a different approach to add a user to their manager's teams
   */
  const addUserToManagerTeamsAlternative = async (userId: string, managerId: string) => {
    try {
      // Get all teams
      const { data: allTeams, error: teamsError } = await supabase
        .from('teams')
        .select('*');
        
      if (teamsError) {
        console.error("Error fetching all teams:", teamsError);
        return false;
      }
      
      // Get manager's team memberships directly using a search across all team members
      const { data: managerTeams, error: managerTeamsError } = await supabase
        .from('team_members')
        .select('team_id, teams:team_id(name)')
        .eq('user_id', managerId);
      
      if (managerTeamsError || !managerTeams || managerTeams.length === 0) {
        console.error("Manager has no teams or error fetching:", managerTeamsError);
        return false;
      }
      
      let teamsAddedCount = 0;
      for (const team of managerTeams) {
        // Check if user is already a member
        const { data: existingMembership, error: membershipError } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', team.team_id)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (membershipError) {
          console.error(`Error checking membership for team ${team.team_id}:`, membershipError);
          continue;
        }
        
        if (!existingMembership) {
          // Add user to team
          const { error: addError } = await supabase
            .from('team_members')
            .insert([{
              team_id: team.team_id,
              user_id: userId,
              role: 'agent'
            }]);
            
          if (!addError) {
            teamsAddedCount++;
            console.log(`Added user to team: ${team.teams?.name || team.team_id}`);
          } else {
            console.error(`Error adding to team ${team.team_id}:`, addError);
          }
        } else {
          console.log(`User already in team ${team.team_id}`);
        }
      }
      
      // Refresh all team-related queries
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
      
      if (teamsAddedCount > 0) {
        toast({
          title: "Teams Updated",
          description: `You've been added to ${teamsAddedCount} of your manager's teams.`,
        });
      }
      
      return teamsAddedCount > 0 || managerTeams.length > 0;
    } catch (error) {
      console.error("Error in alternative team association method:", error);
      return false;
    }
  };

  /**
   * Add user to manager's teams
   */
  const addUserToManagerTeams = async (userId: string, managerId: string) => {
    if (!userId || !managerId) return false;
    
    try {
      console.log(`Adding user ${userId} to teams of manager ${managerId}`);
      
      // First try manual approach (no RPC call)
      try {
        // Get manager's teams
        const { data: managerTeams, error: teamsError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', managerId);
          
        if (teamsError) {
          console.error("Error getting manager teams:", teamsError);
          return await addUserToManagerTeamsAlternative(userId, managerId);
        }
        
        if (!managerTeams || managerTeams.length === 0) {
          console.log("Manager has no teams");
          return false;
        }
        
        let addedToAnyTeam = false;
        
        // For each team, add the user if not already a member
        for (const team of managerTeams) {
          // Check if already a member
          const { data: existingMembership } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', team.team_id)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (!existingMembership) {
            // Add user to team
            const { error: insertError } = await supabase
              .from('team_members')
              .insert([{
                team_id: team.team_id,
                user_id: userId,
                role: 'agent'
              }]);
              
            if (!insertError) {
              addedToAnyTeam = true;
              console.log(`Added user to team ${team.team_id}`);
            }
          }
        }
        
        // Refresh team data in the UI
        if (addedToAnyTeam) {
          // Refresh all team-related queries
          queryClient.invalidateQueries({ queryKey: ['user-teams'] });
          queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
          queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
          
          return true;
        } else {
          console.log("User was already in all teams");
          return true; // Still return true if user is properly associated
        }
      } catch (funcError) {
        console.error("Error with direct approach:", funcError);
      }
      
      // Try multiple approaches to ensure we can get the teams even with RLS issues
      const result = await addUserToManagerTeamsAlternative(userId, managerId);
      
      return result;
    } catch (error) {
      console.error(`Error adding user ${userId} to manager's teams:`, error);
      return false;
    }
  };

  return {
    checkAndUpdateTeamAssociation,
    addUserToManagerTeams,
    processTeamAssociations
  };
};
