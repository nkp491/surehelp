
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
      
      // Special case for nielsenaragon accounts or people managed by them
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
      
      // Directly use the SQL query to bypass RLS policies
      // First, get all teams to check for Momentum teams
      const { data: allTeams } = await supabase
        .from('teams')
        .select('*');
        
      if (!allTeams) {
        console.error("Could not fetch teams");
        return false;
      }
      
      // Filter for Momentum teams
      const momentumTeams = allTeams.filter(team => 
        team.name.toLowerCase().includes('momentum') || 
        team.name.toLowerCase().includes('capitol') || 
        team.name.toLowerCase().includes('capital')
      );
      
      if (momentumTeams.length === 0) {
        console.log("No Momentum teams found, creating a new one");
        
        // Create a new Momentum team
        try {
          const { data: newTeam, error: createError } = await supabase
            .from('teams')
            .insert([{ name: 'Momentum Capitol Team' }])
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating Momentum team:", createError);
            return false;
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
            return false;
          }
          
          console.log(`Added user to new Momentum team with role ${role}`);
          return true;
        } catch (createError) {
          console.error("Error creating Momentum team:", createError);
          return false;
        }
      }
      
      console.log("Found Momentum teams:", momentumTeams);
      
      // Get all team memberships
      const { data: allMemberships } = await supabase
        .from('team_members')
        .select('team_id, user_id');
        
      if (!allMemberships) {
        console.error("Could not fetch team memberships");
        return false;
      }
      
      // For each Momentum team, ensure user is a member
      let addedCount = 0;
      for (const team of momentumTeams) {
        // Check if user is already a member using our client-side data
        const existingMembership = allMemberships.find(
          m => m.team_id === team.id && m.user_id === userId
        );
        
        if (!existingMembership) {
          console.log(`Adding user to ${team.name}`);
          
          // Add user to team
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
      
      return addedCount > 0 || momentumTeams.length > 0;
    } catch (error) {
      console.error("Error checking Momentum teams:", error);
      return false;
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
      
      // Check if manager profile is Nielsen
      const { data: managerProfile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', profile.manager_id)
        .single();
        
      if (managerProfile && 
          (managerProfile.email === 'nielsenaragon@gmail.com' || 
           managerProfile.email === 'nielsenaragon@ymail.com')) {
        console.log("Manager is Nielsen, directly adding to Momentum teams");
        return await checkMomentumTeams(userId, 'agent');
      }
      
      // Get all teams
      const { data: allTeams } = await supabase
        .from('teams')
        .select('*');
        
      if (!allTeams) {
        console.error("Could not fetch teams");
        return false;
      }
      
      // Filter for Momentum teams
      const momentumTeams = allTeams.filter(team => 
        team.name.toLowerCase().includes('momentum') || 
        team.name.toLowerCase().includes('capitol') || 
        team.name.toLowerCase().includes('capital')
      );
      
      if (momentumTeams.length === 0) {
        console.log("No Momentum teams found");
        return false;
      }
      
      const momentumTeamIds = momentumTeams.map(team => team.id);
      
      // Get all team memberships
      const { data: allMemberships } = await supabase
        .from('team_members')
        .select('team_id, user_id');
        
      if (!allMemberships) {
        console.error("Could not fetch team memberships");
        return false;
      }
      
      // Filter for manager's memberships in Momentum teams
      const managerMomentumMemberships = allMemberships.filter(
        m => m.user_id === profile.manager_id && momentumTeamIds.includes(m.team_id)
      );
      
      if (managerMomentumMemberships.length === 0) {
        console.log("Manager is not in any Momentum teams");
        return false;
      }
      
      console.log("Manager is in Momentum teams:", managerMomentumMemberships);
      
      // Add user to these teams
      let addedCount = 0;
      
      for (const membership of managerMomentumMemberships) {
        // Check if user is already in this team
        const existingMembership = allMemberships.find(
          m => m.team_id === membership.team_id && m.user_id === userId
        );
        
        if (!existingMembership) {
          console.log(`Adding user to Momentum team ${membership.team_id}`);
          
          // Add user to team
          const { error: addError } = await supabase
            .from('team_members')
            .insert([{
              team_id: membership.team_id,
              user_id: userId,
              role: 'agent'
            }]);
            
          if (!addError) {
            addedCount++;
            console.log(`Added user to Momentum team ${membership.team_id}`);
          } else {
            console.error(`Error adding user to Momentum team:`, addError);
          }
        } else {
          console.log(`User already in Momentum team ${membership.team_id}`);
        }
      }
      
      if (addedCount > 0) {
        // Refresh queries
        queryClient.invalidateQueries({ queryKey: ['user-teams'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
        queryClient.invalidateQueries({ queryKey: ['user-teams-profile-direct'] });
      }
      
      return addedCount > 0 || managerMomentumMemberships.length > 0;
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
