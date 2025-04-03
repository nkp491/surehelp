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
      
      // Try a direct SQL query to bypass RLS recursion
      try {
        // First, get the manager's teams using the RPC function
        const { data: managerTeamIds, error: managerTeamsError } = await supabase.rpc(
          'get_manager_teams',
          { manager_id: managerId }
        );
        
        if (managerTeamsError) {
          console.log("RPC method error:", managerTeamsError);
          console.log("Falling back to standard query");
          
          // Fallback to standard query if RPC is not set up
          const { data: teamData, error: teamsError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', managerId);
            
          if (teamsError) {
            console.error("Error fetching manager's teams:", teamsError);
            // Try alternative method
            return await addUserToTeamsByManager(user.id, managerId);
          }
          
          if (!teamData || teamData.length === 0) {
            console.log("Manager has no teams");
            return false;
          }
          
          return await processTeamAssociations(user.id, teamData);
        }
        
        if (!managerTeamIds || !Array.isArray(managerTeamIds) || managerTeamIds.length === 0) {
          console.log("Manager has no teams (from RPC)");
          return false;
        }
        
        // Format the RPC result to match the expected structure
        const teamData = managerTeamIds.map(teamId => ({ team_id: teamId }));
        return await processTeamAssociations(user.id, teamData);
      } catch (innerError) {
        console.error("Error in team association process:", innerError);
        return false;
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
      
      // Try multiple approaches to ensure we can get the teams even with RLS issues
      const result = await addUserToTeamsByManager(userId, managerId);
      
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
