
import { supabase } from "@/integrations/supabase/client";

export const useSpecialTeamAssociations = () => {
  /**
   * Special fix for Momentum Capitol association
   */
  const fixMomentumCapitolAssociation = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      // Special case for nielsenaragon@gmail.com
      if (user.email === 'nielsenaragon@gmail.com') {
        console.log("Checking and fixing Momentum Capitol association for", user.email);
        await checkMomentumTeams(user.id);
      }
    } catch (error) {
      console.error("Error in fixMomentumCapitolAssociation:", error);
    }
  };

  /**
   * Check and fix Momentum Capitol teams for special users
   */
  const checkMomentumTeams = async (userId: string) => {
    try {
      // Find all Momentum teams
      const { data: momentumTeams } = await supabase
        .from('teams')
        .select('*')
        .or('name.ilike.%Momentum Capitol%,name.ilike.%Momentum Capital%');
      
      if (momentumTeams && momentumTeams.length > 0) {
        console.log("Found Momentum teams:", momentumTeams);
        
        // For each Momentum team, ensure user is a member
        for (const team of momentumTeams) {
          // Check if user is already a member
          const { data: existingMembership } = await supabase
            .from('team_members')
            .select('id')
            .eq('team_id', team.id)
            .eq('user_id', userId)
            .maybeSingle();
            
          if (!existingMembership) {
            // Add user to team with manager role
            const { error: addError } = await supabase
              .from('team_members')
              .insert([{ 
                team_id: team.id,
                user_id: userId,
                role: 'manager_pro_platinum'
              }]);
              
            console.log(`Added user to ${team.name}:`, addError ? "Error" : "Success");
          } else {
            console.log(`User already member of ${team.name}`);
          }
        }
      }
    } catch (error) {
      console.error("Error checking Momentum teams:", error);
    }
  };

  return {
    fixMomentumCapitolAssociation
  };
};
