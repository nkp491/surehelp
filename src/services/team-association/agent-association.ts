
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
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manager_id')
        .eq('id', user.id)
        .single();
        
      if (profileError || !profile?.manager_id) {
        console.error("No manager associated with this user", profileError);
        
        toast({
          title: "Association Failed",
          description: "You don't have a manager assigned. Please update your profile with a manager.",
          variant: "destructive",
        });
        
        return false;
      }
      
      console.log("Force team association with manager", profile.manager_id);
      
      // Try direct association if the core method fails
      const success = await checkAndUpdateTeamAssociation(profile.manager_id);
      
      if (success) {
        // Refresh all team-related queries
        queryClient.invalidateQueries({ queryKey: ['user-teams'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
        
        toast({
          title: "Team Association Successful",
          description: "You have been added to your manager's teams.",
        });
        
        return true;
      } else {
        // Try a direct approach for association
        try {
          // Get all teams first
          const { data: allTeams } = await supabase
            .from('teams')
            .select('*');
            
          // Find the manager's teams
          const { data: managerTeams } = await supabase
            .from('team_members')
            .select('team_id, teams:team_id(name)')
            .eq('user_id', profile.manager_id);
            
          if (!managerTeams || managerTeams.length === 0) {
            console.log("Manager has no teams");
            
            toast({
              title: "Association Failed",
              description: "Your manager doesn't have any teams yet. Ask them to create a team first.",
              variant: "destructive",
            });
            
            return false;
          }
          
          // Add user to each team
          let addedCount = 0;
          for (const team of managerTeams) {
            // Check if user is already in team
            const { data: existing } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', team.team_id)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (!existing) {
              // Add user to team
              const { error: insertError } = await supabase
                .from('team_members')
                .insert([{
                  team_id: team.team_id,
                  user_id: user.id,
                  role: 'agent'
                }]);
                
              if (!insertError) {
                addedCount++;
                console.log(`Added user to team: ${team.teams?.name || team.team_id}`);
              }
            }
          }
          
          if (addedCount > 0) {
            // Refresh all team-related queries
            queryClient.invalidateQueries({ queryKey: ['user-teams'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
            
            toast({
              title: "Team Association Successful",
              description: `You have been added to ${addedCount} team(s).`,
            });
            
            return true;
          } else {
            console.log("User was already in all manager's teams");
            
            toast({
              title: "Already Associated",
              description: "You're already a member of all your manager's teams.",
            });
            
            return true; // Still return true as the user is properly associated
          }
        } catch (directError) {
          console.error("Error in direct team association:", directError);
          return false;
        }
      }
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
