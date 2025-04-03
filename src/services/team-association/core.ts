
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useTeamAssociationCore = (setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Check if user has a manager and update team associations accordingly
   */
  const checkAndUpdateTeamAssociation = async (managerId?: string): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      console.log("Checking team associations for manager:", managerId);
      if (!managerId) {
        console.log("No manager ID provided");
        return false;
      }
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      // Try to use the RPC function to ensure user is in manager's teams
      try {
        // Call RPC function that handles team association directly in the database
        const { data, error } = await supabase.rpc(
          'ensure_user_in_manager_teams',
          { user_id: user.id, manager_id: managerId }
        );
        
        if (error) {
          console.error("Error in ensure_user_in_manager_teams RPC:", error);
          // Fall back to addUserToTeamsByManager
          return await addUserToTeamsByManager(user.id, managerId);
        }
        
        if (data === true) {
          console.log("Successfully associated user with manager's teams via RPC");
          
          // Invalidate all team-related queries
          queryClient.invalidateQueries({ queryKey: ['user-teams'] });
          queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
          queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
          
          toast({
            title: "Team Association Updated",
            description: "You've been added to your manager's teams.",
          });
          
          return true;
        } else {
          console.log("RPC returned false - manager may not have teams");
          
          // Try direct approach as fallback
          return await addUserToTeamsByManager(user.id, managerId);
        }
      } catch (rpcError) {
        console.error("RPC function error:", rpcError);
        // Fall back to direct method
        return await addUserToTeamsByManager(user.id, managerId);
      }
    } catch (error) {
      console.error("Error in checkAndUpdateTeamAssociation:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Add a user to their manager's teams
   */
  const addUserToTeamsByManager = async (userId: string, managerId: string): Promise<boolean> => {
    console.log("Manually checking and adding user to manager teams");
    
    try {
      // Try the RPC function first
      try {
        const { data: managerTeams, error: teamsError } = await supabase.rpc(
          'get_manager_teams',
          { manager_id: managerId }
        );
        
        if (!teamsError && managerTeams && managerTeams.length > 0) {
          console.log("Successfully fetched manager teams via RPC:", managerTeams);
          
          // Add user to each team
          let addedToAnyTeam = false;
          
          for (const teamId of managerTeams) {
            // Check if user is already in this team
            const { data: existingMembership, error: membershipError } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', teamId)
              .eq('user_id', userId)
              .maybeSingle();
              
            if (membershipError) {
              console.error(`Error checking membership for team ${teamId}:`, membershipError);
              continue;
            }
            
            if (!existingMembership) {
              // Add user to team
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{
                  team_id: teamId,
                  user_id: userId,
                  role: 'agent'
                }]);
                
              if (addError) {
                console.error(`Error adding user to team ${teamId}:`, addError);
              } else {
                console.log(`Added user to team ${teamId}`);
                addedToAnyTeam = true;
              }
            } else {
              console.log(`User already in team ${teamId}`);
            }
          }
          
          if (addedToAnyTeam) {
            queryClient.invalidateQueries({ queryKey: ['user-teams'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
            
            toast({
              title: "Team Association Updated",
              description: "You've been added to your manager's teams.",
            });
          }
          
          return addedToAnyTeam;
        } else {
          console.log("Direct query error or no teams returned:", teamsError);
        }
      } catch (directError) {
        console.log("Direct function call failed:", directError);
      }
      
      // Fall back to a more direct approach
      return await addUserToManagerTeamsAlternative(userId, managerId);
    } catch (error) {
      console.error("Error in addUserToTeamsByManager:", error);
      return await addUserToManagerTeamsAlternative(userId, managerId);
    }
  };

  /**
   * Alternative implementation to avoid RLS recursion issues
   */
  const addUserToManagerTeamsAlternative = async (userId: string, managerId: string): Promise<boolean> => {
    console.log("Using alternative approach to add user to manager teams");
    
    try {
      // For Nielsen accounts, look directly for Momentum teams
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', managerId)
        .single();
        
      if (managerProfile && 
         (managerProfile.email === 'nielsenaragon@gmail.com' || 
          managerProfile.email === 'nielsenaragon@ymail.com')) {
        console.log("Manager is Nielsen - looking for Momentum Capitol teams");
        
        const { data: momentumTeams } = await supabase
          .from('teams')
          .select('*')
          .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
          
        if (momentumTeams && momentumTeams.length > 0) {
          console.log("Found Momentum teams:", momentumTeams);
          
          // Add user to each Momentum team
          let addedToAnyTeam = false;
          
          for (const team of momentumTeams) {
            // Check if user is already in team
            const { data: existingMembership } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', team.id)
              .eq('user_id', userId)
              .maybeSingle();
              
            if (!existingMembership) {
              // Add user to team
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{
                  team_id: team.id,
                  user_id: userId,
                  role: 'agent'
                }]);
                
              if (!addError) {
                console.log(`Added user to ${team.name}`);
                addedToAnyTeam = true;
              } else {
                console.error(`Error adding user to ${team.name}:`, addError);
              }
            } else {
              console.log(`User already in team ${team.name}`);
            }
          }
          
          if (addedToAnyTeam) {
            // Refresh queries
            queryClient.invalidateQueries({ queryKey: ['user-teams'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
            
            return true;
          }
          
          return momentumTeams.length > 0; // True if user is at least in one team
        }
      }
      
      // If not a Nielsen account or no Momentum teams found, try direct queries
      console.log("No Nielsen special case detected or no Momentum teams found");
      
      // Get all teams in the system
      const { data: allTeams } = await supabase
        .from('teams')
        .select('*');
        
      if (!allTeams || allTeams.length === 0) {
        console.log("No teams found in the system");
        return false;
      }
      
      // Get all team memberships in the system
      const { data: allMemberships } = await supabase
        .from('team_members')
        .select('team_id, user_id');
        
      if (!allMemberships) {
        console.log("No team memberships found");
        return false;
      }
      
      // Find teams that the manager belongs to
      const managerTeams = allMemberships
        .filter(m => m.user_id === managerId)
        .map(m => m.team_id);
        
      if (managerTeams.length === 0) {
        console.log("Manager is not in any teams");
        return false;
      }
      
      console.log("Found manager's teams:", managerTeams);
      
      // Check which teams the user is already in
      const userMemberships = allMemberships
        .filter(m => m.user_id === userId)
        .map(m => m.team_id);
        
      // Find manager teams that the user is not in yet
      const teamsToAdd = managerTeams.filter(teamId => !userMemberships.includes(teamId));
      
      if (teamsToAdd.length === 0) {
        console.log("User is already in all manager's teams");
        return true;
      }
      
      // Add user to each team
      let addedToAnyTeam = false;
      
      for (const teamId of teamsToAdd) {
        // Add user to team
        const { error: addError } = await supabase
          .from('team_members')
          .insert([{
            team_id: teamId,
            user_id: userId,
            role: 'agent'
          }]);
          
        if (!addError) {
          console.log(`Added user to team ${teamId}`);
          addedToAnyTeam = true;
        } else {
          console.error(`Error adding user to team ${teamId}:`, addError);
        }
      }
      
      if (addedToAnyTeam) {
        queryClient.invalidateQueries({ queryKey: ['user-teams'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
        
        toast({
          title: "Team Association Updated",
          description: "You've been added to your manager's teams.",
        });
      }
      
      return addedToAnyTeam;
    } catch (error) {
      console.error("Error in addUserToManagerTeamsAlternative:", error);
      return false;
    }
  };

  /**
   * Add a user to their manager's teams
   */
  const addUserToManagerTeams = async (userId: string, managerId: string): Promise<boolean> => {
    setIsProcessing(true);
    
    try {
      return await addUserToTeamsByManager(userId, managerId);
    } catch (error) {
      console.error("Error in addUserToManagerTeams:", error);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    checkAndUpdateTeamAssociation,
    addUserToManagerTeams
  };
};
