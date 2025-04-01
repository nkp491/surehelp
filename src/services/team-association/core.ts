
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
      
      // Get manager's teams
      const { data: managerTeams, error: teamsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', managerId);
        
      if (teamsError) {
        console.error("Error fetching manager's teams:", teamsError);
        return false;
      }
      
      if (!managerTeams || managerTeams.length === 0) {
        console.log("Manager has no teams");
        return false;
      }
      
      console.log(`Found ${managerTeams.length} teams for manager`);
      
      // For each team, check if user is already a member
      let teamsAddedCount = 0;
      for (const teamMembership of managerTeams) {
        const { data: existingMembership, error: membershipError } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', teamMembership.team_id)
          .eq('user_id', user.id)
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
              user_id: user.id,
              role: 'agent'
            }]);
            
          if (!addError) {
            teamsAddedCount++;
          } else {
            console.error(`Error adding to team ${teamMembership.team_id}:`, addError);
          }
        } else {
          console.log(`User already in team ${teamMembership.team_id}`);
        }
      }
      
      // Refresh team data in the UI
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
      
      if (teamsAddedCount > 0) {
        toast({
          title: "Teams Updated",
          description: `You've been added to ${teamsAddedCount} of your manager's teams.`,
        });
        return true;
      } else {
        console.log("No new teams to add");
        return managerTeams.length > 0; // Return true if the manager has teams, even if user was already in all of them
      }
    } catch (error) {
      console.error("Error updating team associations:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    checkAndUpdateTeamAssociation
  };
};
