
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useTeamAssociationCore = (setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Invalidate all team-related queries
   */
  const invalidateTeamQueries = () => {
    queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
    queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
  };

  /**
   * Show success toast for team association
   */
  const showSuccessToast = () => {
    toast({
      title: "Team Association Updated",
      description: "You've been added to your manager's teams.",
    });
  };

  /**
   * Check if user has a manager and update team associations accordingly
   * Legacy implementation kept for compatibility
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
          invalidateTeamQueries();
          
          showSuccessToast();
          
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
   * Legacy implementation kept for compatibility
   */
  const addUserToTeamsByManager = async (userId: string, managerId: string | null): Promise<boolean> => {
    console.log("Manually checking and adding user to manager teams");
    
    try {
      // If managerId is null, try to get it from the user's profile
      if (!managerId) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('manager_id')
          .eq('id', userId)
          .single();
          
        managerId = profile?.manager_id || null;
        
        if (!managerId) {
          console.log("No manager ID found for user");
          return false;
        }
      }
      
      // Try the RPC function first
      try {
        const { data: managerTeams, error: teamsError } = await supabase.rpc(
          'get_manager_teams',
          { manager_id: managerId }
        );
        
        if (!teamsError && managerTeams && Array.isArray(managerTeams) && managerTeams.length > 0) {
          console.log("Successfully fetched manager teams via RPC:", managerTeams);
          
          // Add user to each team
          let addedToAnyTeam = false;
          
          for (const teamId of managerTeams as string[]) {
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
            invalidateTeamQueries();
            showSuccessToast();
          }
          
          return addedToAnyTeam;
        } else {
          console.log("Direct query error or no teams returned:", teamsError);
        }
      } catch (directError) {
        console.log("Direct function call failed:", directError);
      }
      
      // Fall back to a more direct approach using team_members table
      try {
        // Try to get teams from team_members table directly
        const { data: managerTeams, error: tmError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', managerId);
          
        if (!tmError && managerTeams && managerTeams.length > 0) {
          console.log("Successfully fetched manager teams from team_members:", managerTeams);
          
          // Add user to each team
          let addedToAnyTeam = false;
          const teamIds = managerTeams.map(t => t.team_id);
          
          for (const teamId of teamIds) {
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
            invalidateTeamQueries();
            showSuccessToast();
          }
          
          return addedToAnyTeam;
        }
      } catch (error) {
        console.error("Error in team_members query:", error);
      }
      
      return false;
    } catch (error) {
      console.error("Error in addUserToTeamsByManager:", error);
      return false;
    }
  };

  return {
    checkAndUpdateTeamAssociation,
    addUserToTeamsByManager,
    invalidateTeamQueries,
    showSuccessToast,
    supabase
  };
};
