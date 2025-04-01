
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useTeamAssociationService = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isProcessing, setIsProcessing] = useState(false);

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

  /**
   * Special fix for Momentum Capitol association
   */
  const fixMomentumCapitolAssociation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Special case for nielsenaragon@gmail.com
      if (user.email === 'nielsenaragon@gmail.com') {
        console.log("Checking and fixing Momentum Capitol association for", user.email);
        await checkMomentumTeams(user.id);
      }
    } catch (error) {
      console.error("Error in fixMomentumCapitolAssociation:", error);
    }
  };

  /**
   * Check and fix Momentum Capitol teams for special users
   */
  const checkMomentumTeams = async (userId: string) => {
    try {
      // Find all Momentum teams
      const { data: momentumTeams } = await supabase
        .from('teams')
        .select('*')
        .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
      
      if (momentumTeams && momentumTeams.length > 0) {
        console.log("Found Momentum teams:", momentumTeams);
        
        // For each Momentum team, ensure user is a member
        for (const team of momentumTeams) {
          // Check if user is already a member
          const { data: existingMembership } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', team.id)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (!existingMembership) {
            // Add user to team with manager role
            const { error: addError } = await supabase
              .from('team_members')
              .insert([{ 
                team_id: team.id,
                user_id: userId,
                role: 'manager_pro_platinum'
              }]);
              
            console.log(`Added user to ${team.name}:`, addError ? "Error" : "Success");
          } else {
            console.log(`User already member of ${team.name}`);
          }
        }
      }
    } catch (error) {
      console.error("Error checking Momentum teams:", error);
    }
  };

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
      
      return [{ team_id: newTeam.id }];
    } catch (error) {
      console.error("Error ensuring manager has team:", error);
      return null;
    }
  };

  return {
    checkAndUpdateTeamAssociation,
    fixMomentumCapitolAssociation,
    forceAgentTeamAssociation,
    isProcessing
  };
};
