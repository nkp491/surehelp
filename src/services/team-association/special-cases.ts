
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export const useSpecialTeamAssociations = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  /**
   * Special fix for Momentum Capitol association
   */
  const fixMomentumCapitolAssociation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log("Checking Momentum Capitol association for", user.email);
      
      // Special case for nielsenaragon@gmail.com accounts or people managed by them
      const isSpecialUser = user.email === 'nielsenaragon@gmail.com' || 
                           user.email === 'nielsenaragon@ymail.com';
                           
      if (isSpecialUser) {
        console.log("Special case: Fixing Momentum Capitol association for", user.email);
        await checkMomentumTeams(user.id, 'manager_pro_platinum');
        return;
      }
      
      // Check if the user is managed by Nielsen
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manager_id')
        .eq('id', user.id)
        .single();
        
      if (profileError) {
        console.error("Error checking if user is managed by Nielsen:", profileError);
        return;
      }
      
      if (profile?.manager_id) {
        // Check if the manager is Nielsen
        const { data: managerProfile } = await supabase
          .from('profiles')
          .select('email')
          .eq('id', profile.manager_id)
          .single();
          
        if (managerProfile && 
            (managerProfile.email === 'nielsenaragon@gmail.com' || 
             managerProfile.email === 'nielsenaragon@ymail.com')) {
          console.log("User is managed by Nielsen, fixing team associations");
          await checkMomentumTeams(user.id, 'agent');
          
          // Refresh all team-related queries
          queryClient.invalidateQueries({ queryKey: ['user-teams'] });
          queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
          queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
          
          toast({
            title: "Team Association Updated",
            description: "You've been added to your manager's Momentum Capitol teams.",
          });
        }
      }
    } catch (error) {
      console.error("Error in fixMomentumCapitolAssociation:", error);
    }
  };

  /**
   * Check and fix Momentum Capitol teams for special users
   */
  const checkMomentumTeams = async (userId: string, role: string = 'agent') => {
    try {
      console.log(`Checking Momentum teams for user ${userId} with role ${role}`);
      
      // Find all Momentum teams
      const { data: momentumTeams, error: teamError } = await supabase
        .from('teams')
        .select('*')
        .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
      
      if (teamError) {
        console.error("Error finding Momentum teams:", teamError);
        return;
      }
      
      if (!momentumTeams || momentumTeams.length === 0) {
        console.log("No Momentum teams found, creating a new one");
        
        // Create a new Momentum team if none exists
        try {
          const { data: newTeam, error: createError } = await supabase
            .from('teams')
            .insert([{ name: 'Momentum Capitol Team' }])
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating Momentum team:", createError);
            return;
          }
          
          console.log("Created new Momentum team:", newTeam);
          
          // Add user to the new team
          const { error: addError } = await supabase
            .from('team_members')
            .insert([{
              team_id: newTeam.id,
              user_id: userId,
              role: role
            }]);
            
          if (addError) {
            console.error("Error adding user to new Momentum team:", addError);
          } else {
            console.log(`Added user to new Momentum team with role ${role}`);
          }
          
          return;
        } catch (createError) {
          console.error("Error creating Momentum team:", createError);
          return;
        }
      }
      
      console.log("Found Momentum teams:", momentumTeams);
      
      // For each Momentum team, ensure user is a member
      let addedCount = 0;
      for (const team of momentumTeams) {
        // Check if user is already a member
        const { data: existingMembership, error: membershipError } = await supabase
          .from('team_members')
          .select('id')
          .eq('team_id', team.id)
          .eq('user_id', userId)
          .maybeSingle();
          
        if (membershipError && !membershipError.message.includes('No rows')) {
          console.error(`Error checking membership for team ${team.name}:`, membershipError);
          continue;
        }
            
        if (!existingMembership) {
          // Add user to team with specified role
          const { error: addError } = await supabase
            .from('team_members')
            .insert([{ 
              team_id: team.id,
              user_id: userId,
              role: role
            }]);
              
          if (!addError) {
            addedCount++;
            console.log(`Added user to ${team.name} with role ${role}`);
          } else {
            console.error(`Error adding user to ${team.name}:`, addError);
          }
        } else {
          console.log(`User already member of ${team.name}`);
        }
      }
      
      console.log(`Added user to ${addedCount} Momentum teams`);
      
      // Refresh all team-related queries if any teams were added
      if (addedCount > 0) {
        queryClient.invalidateQueries({ queryKey: ['user-teams'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
      }
    } catch (error) {
      console.error("Error checking Momentum teams:", error);
    }
  };

  /**
   * Check for associations with managers who are part of the Momentum Capitol team
   */
  const checkMomentumManagerAssociations = async (userId: string) => {
    try {
      console.log("Checking for Momentum manager associations");
      
      // Get user's manager
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('manager_id')
        .eq('id', userId)
        .single();
        
      if (profileError || !profile?.manager_id) {
        console.log("User has no manager");
        return false;
      }
      
      // Check if manager is part of Momentum teams
      const { data: momentumTeams } = await supabase
        .from('teams')
        .select('*')
        .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
        
      if (!momentumTeams || momentumTeams.length === 0) {
        console.log("No Momentum teams found");
        return false;
      }
      
      const momentumTeamIds = momentumTeams.map(team => team.id);
      
      // Check if manager is in any Momentum team
      const { data: managerTeams, error: managerTeamsError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', profile.manager_id)
        .in('team_id', momentumTeamIds);
        
      if (managerTeamsError) {
        console.error("Error checking manager's Momentum team membership:", managerTeamsError);
        return false;
      }
      
      if (managerTeams && managerTeams.length > 0) {
        console.log("Manager is part of Momentum teams");
        
        // Add user to the same Momentum teams
        for (const teamMembership of managerTeams) {
          // Check if user is already in the team
          const { data: existingMembership } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', teamMembership.team_id)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (!existingMembership) {
            // Add user to team
            const { error: addError } = await supabase
              .from('team_members')
              .insert([{
                team_id: teamMembership.team_id,
                user_id: userId,
                role: 'agent'
              }]);
              
            if (!addError) {
              console.log(`Added user to Momentum team ${teamMembership.team_id}`);
            } else {
              console.error(`Error adding user to Momentum team:`, addError);
            }
          }
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error("Error in checkMomentumManagerAssociations:", error);
      return false;
    }
  };

  return {
    fixMomentumCapitolAssociation,
    checkMomentumTeams,
    checkMomentumManagerAssociations
  };
};
