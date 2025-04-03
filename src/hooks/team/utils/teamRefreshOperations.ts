
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { QueryClient } from "@tanstack/react-query";
import { useTeamAssociationService } from "@/services/team-association";

/**
 * Hook for team refresh operations
 */
export const useTeamRefreshOperations = (
  refetchTeams: () => Promise<any>,
  setShowAlert: (show: boolean) => void,
  setAlertMessage: (message: string) => void,
  setFixingTeamAssociation: (fixing: boolean) => void
) => {
  const { toast } = useToast();
  const queryClient = new QueryClient();
  const { 
    checkAndUpdateTeamAssociation, 
    fixMomentumCapitolAssociation,
    forceAgentTeamAssociation,
    checkMomentumManagerAssociations
  } = useTeamAssociationService();

  const handleRefreshTeams = async () => {
    setShowAlert(false);
    setFixingTeamAssociation(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log("Refreshing teams for user:", user.email);
      
      // Get user profile to check for manager_id
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manager_id, email')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile:", profileError);
        setFixingTeamAssociation(false);
        return;
      }
      
      // Special case for Nielsen accounts
      const specialEmails = ['nielsenaragon@gmail.com', 'nielsenaragon@ymail.com'];
      
      if (specialEmails.includes(profile.email) || specialEmails.includes(user.email || '')) {
        console.log("Special refresh for Nielsen");
        await fixMomentumCapitolAssociation();
      } 
      else if (profile.manager_id) {
        // Check if the manager is Nielsen
        const { data: managerProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', profile.manager_id)
          .single();
          
        if (managerProfile && specialEmails.includes(managerProfile.email)) {
          console.log("Special refresh for user managed by Nielsen");
          // First try Momentum team association
          const momentumSuccess = await checkMomentumManagerAssociations(user.id);
          
          if (!momentumSuccess) {
            // Fall back to standard association
            await fixMomentumCapitolAssociation();
          }
        } else {
          // Standard agent refresh
          console.log("Agent refresh - associating with manager's teams");
          const success = await checkAndUpdateTeamAssociation(profile.manager_id);
          
          if (!success) {
            setAlertMessage("Could not find any teams associated with your manager. Please contact your manager.");
            setShowAlert(true);
          }
        }
      }
      
      // Invalidate and refetch all team-related queries
      await refetchTeams();
      
      // Also invalidate other team-related queries to ensure consistency
      await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      await queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
      await queryClient.invalidateQueries({ queryKey: ['team-members'] });
      
      console.log("Teams refreshed successfully");
      
      toast({
        title: "Teams Refreshed",
        description: "Your teams list has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing teams:", error);
      toast({
        title: "Error",
        description: "There was a problem refreshing your teams.",
        variant: "destructive",
      });
      
      setAlertMessage("Failed to refresh teams. Please try again later.");
      setShowAlert(true);
    } finally {
      setFixingTeamAssociation(false);
    }
  };

  const handleForceTeamAssociation = async () => {
    setShowAlert(false);
    setFixingTeamAssociation(true);
    
    try {
      console.log("Forcing team association");
      const success = await forceAgentTeamAssociation();
      
      if (success) {
        await refetchTeams();
        await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
        
        toast({
          title: "Teams Updated",
          description: "Your team associations have been updated.",
        });
      } else {
        setAlertMessage("Could not associate you with your manager's teams. Your manager may not have any teams yet.");
        setShowAlert(true);
      }
    } catch (error) {
      console.error("Error in force team association:", error);
      setAlertMessage("Failed to update team associations. Please try again later.");
      setShowAlert(true);
    } finally {
      setFixingTeamAssociation(false);
    }
  };

  return {
    handleRefreshTeams,
    handleForceTeamAssociation
  };
};
