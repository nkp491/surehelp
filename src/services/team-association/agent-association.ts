
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
        
        // Handle Nielsen special case - Direct approach to avoid RLS issues
        const { data: momentumTeams } = await supabase
          .from('teams')
          .select('*')
          .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
          
        if (momentumTeams && momentumTeams.length > 0) {
          console.log(`Found ${momentumTeams.length} Momentum teams`);
          
          // For each Momentum team, ensure user is a member
          let addedToAnyTeam = false;
          for (const team of momentumTeams) {
            // Check if user is already in team
            const { data: existingMembership, error: membershipError } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', team.id)
              .eq('user_id', user.id)
              .maybeSingle();
              
            if (membershipError && !membershipError.message.includes('No rows')) {
              console.error(`Error checking membership for ${team.name}:`, membershipError);
              continue;
            }
            
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
          // No Momentum teams found, create one
          console.log("No Momentum teams found, creating one");
          
          try {
            // Create a new Momentum team
            const { data: newTeam, error: createError } = await supabase
              .from('teams')
              .insert([{ name: 'Momentum Capitol Team' }])
              .select()
              .single();
              
            if (createError) {
              console.error("Error creating Momentum team:", createError);
              
              toast({
                title: "Association Failed",
                description: "Could not create Momentum Capitol team.",
                variant: "destructive",
              });
              
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
              
              toast({
                title: "Association Failed",
                description: "Could not add you to the Momentum Capitol team.",
                variant: "destructive",
              });
              
              return false;
            }
            
            // Refresh queries
            queryClient.invalidateQueries({ queryKey: ['user-teams'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
            queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
            
            toast({
              title: "Team Association Successful",
              description: "Created and added you to Momentum Capitol team.",
            });
            
            return true;
          } catch (createError) {
            console.error("Error in Momentum team creation:", createError);
            return false;
          }
        }
      }
      
      // If the special case doesn't apply, try manual association approach
      try {
        console.log("Using direct approach to associate user with manager's teams");
        
        // Get all teams in the system
        const { data: allTeams } = await supabase
          .from('teams')
          .select('*');
          
        if (!allTeams || allTeams.length === 0) {
          console.log("No teams found in the system");
          return await checkAndUpdateTeamAssociation(profile.manager_id);
        }
        
        // Get all team memberships in the system
        const { data: allMemberships } = await supabase
          .from('team_members')
          .select('team_id, user_id');
          
        if (!allMemberships) {
          console.log("No team memberships found");
          return await checkAndUpdateTeamAssociation(profile.manager_id);
        }
        
        // Find teams that the manager belongs to
        const managerTeams = allMemberships
          .filter(m => m.user_id === profile.manager_id)
          .map(m => m.team_id);
          
        if (managerTeams.length === 0) {
          console.log("Manager is not in any teams");
          
          toast({
            title: "Association Failed",
            description: "Your manager doesn't have any teams yet. Ask them to create a team first.",
            variant: "destructive",
          });
          
          return false;
        }
        
        console.log("Found manager's teams:", managerTeams);
        
        // Check which teams the user is already in
        const userMemberships = allMemberships
          .filter(m => m.user_id === user.id)
          .map(m => m.team_id);
          
        // Find manager teams that the user is not in yet
        const teamsToAdd = managerTeams.filter(teamId => !userMemberships.includes(teamId));
        
        if (teamsToAdd.length === 0) {
          console.log("User is already in all manager's teams");
          
          toast({
            title: "Already Associated",
            description: "You're already a member of all your manager's teams.",
          });
          
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
              user_id: user.id,
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
          // Refresh queries
          queryClient.invalidateQueries({ queryKey: ['user-teams'] });
          queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
          queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
          
          toast({
            title: "Team Association Successful",
            description: `You have been added to ${teamsToAdd.length} team(s).`,
          });
          
          return true;
        }
        
        // Fall back to the core method if direct approach fails
        return await checkAndUpdateTeamAssociation(profile.manager_id);
      } catch (directError) {
        console.error("Error in direct team association:", directError);
        // Try the core method as a last resort
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
