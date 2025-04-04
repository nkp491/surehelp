
import { RefetchOptions, QueryObserverResult } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTeamRefreshOperations = (
  refetchTeams: <TPageData>(options?: RefetchOptions) => Promise<QueryObserverResult>,
  setShowAlert: React.Dispatch<React.SetStateAction<boolean>>,
  setAlertMessage: React.Dispatch<React.SetStateAction<string>>,
  setFixingTeamAssociation: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const { toast } = useToast();

  /**
   * Handle refreshing teams
   */
  const handleRefreshTeams = async () => {
    console.log("Refreshing teams");
    setShowAlert(false);
    
    try {
      await refetchTeams();
      
      toast({
        title: "Teams Refreshed",
        description: "Your team list has been refreshed.",
      });
    } catch (error) {
      console.error("Error refreshing teams:", error);
      setAlertMessage("There was a problem refreshing your teams. Please try again later.");
      setShowAlert(true);
    }
  };

  /**
   * Handle forcing team association
   */
  const handleForceTeamAssociation = async (): Promise<void> => {
    setFixingTeamAssociation(true);
    setShowAlert(false);
    
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAlertMessage("You must be logged in to perform this action.");
        setShowAlert(true);
        return;
      }
      
      console.log("Forcing team association for user:", user.id);
      
      // First, try to use the secure function
      try {
        const { data, error } = await supabase.rpc(
          'force_agent_team_association' as any,
          { agent_id: user.id }
        );
        
        if (error) {
          console.error("Error in force_agent_team_association:", error);
          throw error; // Fall through to the next approach
        }
        
        if (data === true) {
          console.log("Successfully associated user with teams via secure function");
          toast({
            title: "Team Association Fixed",
            description: "You've been added to your manager's teams.",
          });
          
          // Refresh teams to show changes
          await refetchTeams();
          return;
        }
      } catch (secureError) {
        console.error("Secure function failed:", secureError);
        // Continue to backup approach
      }
      
      // Get the user's profile to find their manager
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manager_id')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error getting profile:", profileError);
        setAlertMessage("There was a problem finding your manager. Please contact support.");
        setShowAlert(true);
        return;
      }
      
      if (!profile.manager_id) {
        console.log("User has no manager assigned");
        setAlertMessage("You don't have a manager assigned. Please add a manager first.");
        setShowAlert(true);
        return;
      }
      
      // Try to use the ensure_user_in_manager_teams RPC function
      try {
        const { data, error } = await supabase.rpc(
          'ensure_user_in_manager_teams',
          { user_id: user.id, manager_id: profile.manager_id }
        );
        
        if (error) {
          console.error("Error in ensure_user_in_manager_teams:", error);
          throw error;
        }
        
        console.log("Result from ensure_user_in_manager_teams:", data);
        
        toast({
          title: "Team Association Fixed",
          description: data ? "You've been added to your manager's teams." : "You were already in all your manager's teams.",
        });
        
        // Refresh teams to show changes
        await refetchTeams();
      } catch (rpcError) {
        console.error("RPC error:", rpcError);
        
        // Last resort: try to get manager's teams and add the user to them manually
        try {
          const { data: managerTeams, error: teamsError } = await supabase
            .from('team_members')
            .select('team_id')
            .eq('user_id', profile.manager_id);
            
          if (teamsError) {
            console.error("Error getting manager's teams:", teamsError);
            throw teamsError;
          }
          
          if (!managerTeams || managerTeams.length === 0) {
            console.log("Manager has no teams");
            setAlertMessage("Your manager doesn't have any teams yet.");
            setShowAlert(true);
            return;
          }
          
          // Add the user to each team
          let addedToAnyTeam = false;
          
          for (const teamMember of managerTeams) {
            const { error: addError } = await supabase
              .from('team_members')
              .insert([{
                team_id: teamMember.team_id,
                user_id: user.id,
                role: 'agent'
              }])
              .select(); // Using select() instead of onConflict which isn't in the types
              
            if (!addError) {
              addedToAnyTeam = true;
            }
          }
          
          if (addedToAnyTeam) {
            toast({
              title: "Team Association Fixed",
              description: "You've been added to your manager's teams.",
            });
          } else {
            console.log("User was already in all manager's teams");
            toast({
              title: "No Changes Needed",
              description: "You were already in all your manager's teams.",
            });
          }
          
          // Refresh teams to show changes
          await refetchTeams();
        } catch (finalError) {
          console.error("Final error in force team association:", finalError);
          setAlertMessage("There was a problem associating you with your manager's teams. Please try again later.");
          setShowAlert(true);
        }
      }
    } catch (error) {
      console.error("Error in handleForceTeamAssociation:", error);
      setAlertMessage("There was a problem with team association. Please try again later.");
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
