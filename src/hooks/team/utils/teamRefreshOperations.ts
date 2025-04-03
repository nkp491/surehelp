
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
      
      // Special handling for kirbyaragon@gmail.com
      if (user.email === 'kirbyaragon@gmail.com') {
        console.log("Special case refresh for kirbyaragon@gmail.com");
        
        // Get the manager info
        const { data: profile } = await supabase
          .from('profiles')
          .select('manager_id')
          .eq('id', user.id)
          .single();
          
        if (profile?.manager_id) {
          const { data: managerProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', profile.manager_id)
            .single();
            
          if (managerProfile && 
              (managerProfile.email === 'nielsenaragon@gmail.com' || 
               managerProfile.email === 'nielsenaragon@ymail.com')) {
            console.log("kirbyaragon is managed by Nielsen, fixing team associations");
            await fixMomentumCapitolAssociation();
            await refetchTeams();
            
            // Also try manual association as backup
            const success = await forceAgentTeamAssociation();
            
            if (!success) {
              setAlertMessage("Could not associate you with Momentum Capitol team. Please try again or contact support.");
              setShowAlert(true);
            }
            
            return;
          }
        }
      }
      
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      
      console.log("Forcing team association for", user.email);
      
      // Special handling for kirbyaragon@gmail.com
      if (user.email === 'kirbyaragon@gmail.com') {
        console.log("Special case force association for kirbyaragon@gmail.com");
        
        // Get the manager info
        const { data: profile } = await supabase
          .from('profiles')
          .select('manager_id')
          .eq('id', user.id)
          .single();
          
        if (profile?.manager_id) {
          const { data: managerProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', profile.manager_id)
            .single();
            
          if (managerProfile && 
              (managerProfile.email === 'nielsenaragon@gmail.com' || 
               managerProfile.email === 'nielsenaragon@ymail.com')) {
            console.log("kirbyaragon is managed by Nielsen, fixing Momentum Capitol team");
            
            // Try the Momentum association first
            await fixMomentumCapitolAssociation();
            
            // Get all teams
            const { data: allTeams } = await supabase
              .from('teams')
              .select('*');
              
            // Filter for Momentum teams
            const momentumTeams = allTeams.filter(team => 
              team.name.toLowerCase().includes('momentum') || 
              team.name.toLowerCase().includes('capitol') || 
              team.name.toLowerCase().includes('capital')
            );
            
            // If Momentum teams exist, try to add user to them directly
            if (momentumTeams && momentumTeams.length > 0) {
              console.log("Found Momentum teams, adding user directly:", momentumTeams);
              
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
                    console.log(`Added user to ${team.name}`);
                    addedToAnyTeam = true;
                  } else {
                    console.error(`Error adding user to ${team.name}:`, addError);
                  }
                } else {
                  console.log(`User already in team ${team.name}`);
                }
              }
              
              // Refresh teams
              await refetchTeams();
              
              // Refresh other queries
              await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
              await queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
              
              toast({
                title: addedToAnyTeam ? "Teams Updated" : "Already Associated",
                description: addedToAnyTeam 
                  ? "You've been added to Momentum Capitol teams." 
                  : "You're already a member of all Momentum Capitol teams.",
              });
              
              return true;
            }
            
            // If no Momentum teams, try to create one
            if (!momentumTeams || momentumTeams.length === 0) {
              console.log("No Momentum teams found, creating one");
              
              // Create a new Momentum team
              const { data: newTeam, error: createError } = await supabase
                .from('teams')
                .insert([{ name: 'Momentum Capitol Team' }])
                .select()
                .single();
                
              if (createError) {
                console.error("Error creating Momentum team:", createError);
                return false;
              }
              
              // Add user to the new team
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{
                  team_id: newTeam.id,
                  user_id: user.id,
                  role: 'agent'
                }]);
                
              if (addError) {
                console.error("Error adding user to new Momentum team:", addError);
                return false;
              }
              
              // Refresh teams
              await refetchTeams();
              
              // Refresh other queries
              await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
              await queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
              
              toast({
                title: "Teams Updated",
                description: "Created and added you to Momentum Capitol team.",
              });
              
              return true;
            }
          }
        }
      }
      
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
      
      return success;
    } catch (error) {
      console.error("Error in force team association:", error);
      setAlertMessage("Failed to update team associations. Please try again later.");
      setShowAlert(true);
      return false;
    } finally {
      setFixingTeamAssociation(false);
    }
  };

  return {
    handleRefreshTeams,
    handleForceTeamAssociation
  };
};
