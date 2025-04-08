
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

export const useAgentTeamAssociation = (
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>,
  checkAndUpdateTeamAssociation: (managerId: string) => Promise<boolean>
) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  /**
   * Force team association for an agent with their manager's teams
   * Uses secure database functions instead of special case handling
   */
  const forceAgentTeamAssociation = async () => {
    setIsProcessing(true);
    
    try {
      // Get current user profile to get manager ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("No authenticated user found");
        return false;
      }
      
      console.log("Starting team association for user:", user.email);
      
      // Get the user's profile to check for manager
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manager_id, email')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile for team association:", profileError);
        
        toast({
          title: "Association Failed",
          description: "Could not retrieve your profile information.",
          variant: "destructive",
        });
        
        return false;
      }
      
      // If manager ID is missing, show appropriate message
      if (!profile?.manager_id) {
        console.error("No manager associated with this user");
        
        toast({
          title: "Association Failed",
          description: "You don't have a manager assigned. Please update your profile with a manager.",
          variant: "destructive",
        });
        
        return false;
      }
      
      console.log("Force team association with manager", profile.manager_id);
      
      // Call our secure function to add the user to manager's teams
      const { data: associationResult, error: associationError } = await supabase.rpc(
        'force_agent_team_association',
        { agent_id: user.id }
      );
      
      if (associationError) {
        console.error("Error in force_agent_team_association:", associationError);
        // Fall back to the other approach if RPC fails
        return await checkAndUpdateTeamAssociation(profile.manager_id);
      }
      
      // If we were successful in associating with at least one team
      if (associationResult) {
        console.log("Successfully associated user with teams via secure function");
        
        // Refresh all team-related queries
        queryClient.invalidateQueries({ queryKey: ['user-teams'] });
        queryClient.invalidateQueries({ queryKey: ['direct-teams'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
        
        toast({
          title: "Team Association Successful",
          description: "You have been added to your manager's teams.",
        });
        
        return true;
      }
      
      // If the secure function didn't make any changes (user might already be in all teams)
      console.log("No changes made by force_agent_team_association, trying add_user_to_manager_teams");
      
      // Try the add_user_to_manager_teams function as a backup
      const { data: addResult, error: addError } = await supabase.rpc(
        'add_user_to_manager_teams',
        { user_id: user.id, manager_id: profile.manager_id }
      );
      
      if (addError) {
        console.error("Error in add_user_to_manager_teams:", addError);
        // Last resort, use the passed-in function
        return await checkAndUpdateTeamAssociation(profile.manager_id);
      }
      
      if (addResult) {
        console.log("Successfully added user to manager teams");
        
        // Refresh all team-related queries
        queryClient.invalidateQueries({ queryKey: ['user-teams'] });
        queryClient.invalidateQueries({ queryKey: ['direct-teams'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
        
        toast({
          title: "Team Association Successful",
          description: "You have been added to your manager's teams.",
        });
        
        return true;
      }
      
      // If both functions didn't make changes, user is likely already in all teams
      toast({
        title: "No Changes Needed",
        description: "You're already a member of all your manager's teams.",
      });
      
      return true;
    } catch (error) {
      console.error("Error in forceAgentTeamAssociation:", error);
      
      toast({
        title: "Association Failed",
        description: "There was a problem associating you with your manager's teams.",
        variant: "destructive",
      });
      
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return { forceAgentTeamAssociation };
};
