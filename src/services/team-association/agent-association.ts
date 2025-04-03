
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
      
      console.log("Starting team association for user:", user.email);
      
      // Special case for users managed by nielsenaragon@gmail.com
      // Add them directly to Momentum Capitol team if their manager is Nielsen
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
      
      // If manager ID is missing but we have a user, show appropriate message
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
      
      // Check if user is managed by nielsenaragon
      const { data: managerProfile, error: managerError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', profile.manager_id)
        .single();
        
      if (!managerError && managerProfile && 
          (managerProfile.email === 'nielsenaragon@gmail.com' || 
           managerProfile.email === 'nielsenaragon@ymail.com')) {
        
        console.log("Special case: Manager is Nielsen Aragon");
        
        // First, try to find the Momentum Capitol team
        const { data: momentumTeams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
          
        if (teamsError) {
          console.error("Error finding Momentum teams:", teamsError);
        } else if (momentumTeams && momentumTeams.length > 0) {
          console.log(`Found ${momentumTeams.length} Momentum teams:`, momentumTeams);
          
          // For each Momentum team, ensure user is a member
          let addedToAnyTeam = false;
          for (const team of momentumTeams) {
            // Check if user is already in team
            const { data: existingMembership } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', team.id)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (!existingMembership) {
              // Add user to team
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{
                  team_id: team.id,
                  user_id: user.id,
                  role: 'agent'
                }]);
                
              if (!addError) {
                addedToAnyTeam = true;
                console.log(`Successfully added user to ${team.name}`);
              } else {
                console.error(`Error adding user to ${team.name}:`, addError);
              }
            } else {
              console.log(`User already in team ${team.name}`);
            }
          }
          
          if (addedToAnyTeam) {
            // Refresh all team-related queries
            queryClient.invalidateQueries({ queryKey: ['user-teams'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
            
            toast({
              title: "Team Association Successful",
              description: "You have been added to Momentum Capitol team(s).",
            });
            
            return true;
          } else {
            console.log("User was already in all Momentum teams");
            
            toast({
              title: "Already Associated",
              description: "You're already a member of all Momentum Capitol teams.",
            });
            
            return true;
          }
        } else {
          console.log("No Momentum teams found, will try standard association");
        }
      }
      
      // If the special case didn't work or doesn't apply, try manual association approach
      try {
        console.log("Associating user with manager's teams");
        
        // Get manager's teams
        const { data: managerTeams, error: teamError } = await supabase
          .from('team_members')
          .select('team_id, teams:team_id(name)')
          .eq('user_id', profile.manager_id);
          
        if (teamError) {
          console.error("Error getting manager's teams:", teamError);
          // Fall back to the core method
          return await checkAndUpdateTeamAssociation(profile.manager_id);
        }
        
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
        // Try the core method if direct approach fails
        return await checkAndUpdateTeamAssociation(profile.manager_id);
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
