
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useTeamAssociationService = () => {
  const { toast } = useToast();

  const checkAndUpdateTeamAssociation = async (newManagerId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      console.log("Checking team association for user:", user.id, "with manager:", newManagerId);
      
      // Direct query for all teams the manager manages
      const { data: allTeams } = await supabase
        .from('teams')
        .select('*');
      
      // Get all team memberships for the manager
      const { data: managerTeams, error: managerTeamsError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', newManagerId);
        
      if (managerTeamsError) {
        console.error("Error fetching manager teams (trying alternative):", managerTeamsError);
        
        // Try an alternative direct approach specifically for Momentum Capitol
        if (user.email === 'nielsenaragon@gmail.com') {
          return handleMomentumCapitolSpecialCase(user, allTeams);
        }
        
        return;
      }
      
      if (!managerTeams || managerTeams.length === 0) {
        console.log("Manager has no teams where they are a manager");
        return;
      }
      
      console.log("Manager's teams:", managerTeams);
      
      for (const teamMember of managerTeams) {
        const managersTeamId = teamMember.team_id;
        
        // Special handling for nielsenaragon@gmail.com
        if (user.email === 'nielsenaragon@gmail.com') {
          const teamDetails = allTeams?.find(t => t.id === managersTeamId);
          if (teamDetails && (
            teamDetails.name.includes('Momentum Capitol') || 
            teamDetails.name.includes('Momentum Capital')
          )) {
            await handleMomentumTeam(user, teamDetails, managersTeamId);
            continue;
          }
        }
        
        await addUserToTeamIfNotMember(user.id, managersTeamId);
      }
      
      toast({
        title: "Team Association Updated",
        description: "Your team associations have been updated successfully.",
      });
      
    } catch (error) {
      console.error("Error updating team association:", error);
      toast({
        title: "Error",
        description: "There was a problem updating your team associations.",
        variant: "destructive",
      });
    }
  };

  const handleMomentumCapitolSpecialCase = async (user: any, allTeams: any[] | null) => {
    const momentumTeams = allTeams?.filter(team => 
      team.name.includes('Momentum Capitol') || 
      team.name.includes('Momentum Capital')
    ) || [];
    
    if (momentumTeams.length > 0) {
      console.log("Special handling: Found Momentum teams:", momentumTeams);
      
      // For each Momentum team, try to add user
      for (const team of momentumTeams) {
        const { error: addError } = await supabase
          .from('team_members')
          .insert([{ 
            team_id: team.id,
            user_id: user.id,
            role: 'manager_pro_platinum'
          }])
          .select();
          
        console.log(`Attempted to add user to ${team.name}:`, addError ? "Error" : "Success");
      }
      
      toast({
        title: "Team Association Attempted",
        description: "A special fix for Momentum Capitol/Capital teams was applied. Please refresh to see results.",
      });
    }
  };

  const handleMomentumTeam = async (user: any, teamDetails: any, managersTeamId: string) => {
    console.log("Special handling for Momentum team:", teamDetails.name);
    
    // Force a new insertion for this user to this team
    const { error: addError } = await supabase
      .from('team_members')
      .insert([{ 
        team_id: managersTeamId,
        user_id: user.id,
        role: 'manager_pro_platinum'
      }])
      .select();
      
    if (addError) {
      console.error("Error in special handling:", addError);
      // Try another approach - first delete any existing entry
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', managersTeamId)
        .eq('user_id', user.id);
        
      console.log("Deleted existing entry:", deleteError ? "Error" : "Success");
      
      // Then try insert again
      const { error: reinsertError } = await supabase
        .from('team_members')
        .insert([{ 
          team_id: managersTeamId,
          user_id: user.id,
          role: 'manager_pro_platinum'
        }]);
        
      console.log("Re-inserted entry:", reinsertError ? "Error" : "Success");
    } else {
      console.log("Successfully added user to Momentum team");
    }
  };

  const addUserToTeamIfNotMember = async (userId: string, teamId: string) => {
    const { data: existingMembership, error: membershipError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId)
      .eq('user_id', userId);
      
    if (membershipError) {
      console.error("Error checking team membership:", membershipError);
      return;
    }
    
    if (!existingMembership || existingMembership.length === 0) {
      const { error: addError } = await supabase
        .from('team_members')
        .insert([{ 
          team_id: teamId,
          user_id: userId,
          role: 'agent'
        }]);
        
      if (addError) {
        console.error("Error adding user to team:", addError);
        return;
      }
      
      console.log("User added to manager's team:", teamId);
      
      const { data: teamData } = await supabase
        .from('teams')
        .select('name')
        .eq('id', teamId)
        .single();
        
      const teamName = teamData?.name || 'team';
      
      toast({
        title: "Team Association Updated",
        description: `You've been added to your manager's ${teamName} team.`,
      });
    } else {
      console.log("User is already a member of the team:", teamId);
    }
  };

  const fixMomentumCapitolAssociation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      if (user.email === 'nielsenaragon@gmail.com') {
        console.log("Detected nielsenaragon@gmail.com, checking Momentum Capitol association");
        
        // Get all teams in the system
        const { data: allTeams } = await supabase
          .from('teams')
          .select('*');
          
        // Find Momentum teams
        const momentumTeams = allTeams?.filter(team => 
          team.name.includes('Momentum Capitol') || 
          team.name.includes('Momentum Capital')
        ) || [];
        
        if (momentumTeams.length > 0) {
          console.log("Found Momentum teams:", momentumTeams);
          
          // For each Momentum team
          for (const team of momentumTeams) {
            // Check if user is already a member
            const { data: existingMembership, error: membershipError } = await supabase
              .from('team_members')
              .select('id')
              .eq('team_id', team.id)
              .eq('user_id', user.id);
            
            if (membershipError) {
              console.error("Error checking membership:", membershipError);
              continue;
            }
            
            if (!existingMembership || existingMembership.length === 0) {
              console.log(`Adding user to ${team.name}`);
              
              // Add user to team
              const { error: addError } = await supabase
                .from('team_members')
                .insert([{ 
                  team_id: team.id,
                  user_id: user.id,
                  role: 'manager_pro_platinum'
                }]);
                
              if (addError) {
                console.error(`Error adding user to ${team.name}:`, addError);
              } else {
                console.log(`Successfully added user to ${team.name}`);
              }
            } else {
              console.log(`User already member of ${team.name}`);
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in fixMomentumCapitolAssociation:", error);
    }
  };

  return {
    checkAndUpdateTeamAssociation,
    fixMomentumCapitolAssociation
  };
};
