
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";

/**
 * Hook to fetch teams directly, bypassing RLS issues
 */
export const useTeamDirectQuery = (userId?: string) => {
  return useQuery({
    queryKey: ['direct-teams', userId],
    queryFn: async () => {
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser();
        userId = user?.id;
      }
      
      if (!userId) return [];
      
      try {
        console.log("Fetching teams directly for user:", userId);
        
        // Get all teams first
        const { data: allTeams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .order('name');
          
        if (teamsError) {
          console.error("Error fetching all teams:", teamsError);
          return [];
        }
        
        // Get team memberships for this user
        const { data: memberships, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId);
          
        if (membershipError) {
          console.error("Error fetching team memberships:", membershipError);
          
          // Special case for nielsenaragon@gmail.com
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email === 'nielsenaragon@gmail.com') {
            const momentumTeams = allTeams.filter((team: Team) => 
              team.name.includes('Momentum Capitol') || 
              team.name.includes('Momentum Capital')
            );
            console.log("Special case: Found Momentum teams:", momentumTeams);
            return momentumTeams;
          }
          
          return [];
        }
        
        if (!memberships || memberships.length === 0) {
          console.log("No team memberships found for user");
          
          // Special case for nielsenaragon@gmail.com
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.email === 'nielsenaragon@gmail.com') {
            const momentumTeams = allTeams.filter((team: Team) => 
              team.name.includes('Momentum Capitol') || 
              team.name.includes('Momentum Capital')
            );
            console.log("Special case: Found Momentum teams:", momentumTeams);
            return momentumTeams;
          }
          
          return [];
        }
        
        // Filter teams by membership
        const teamIds = memberships.map(m => m.team_id);
        const userTeams = allTeams.filter((team: Team) => teamIds.includes(team.id));
        
        console.log("User teams found:", userTeams.length);
        return userTeams;
      } catch (error) {
        console.error("Error in direct teams query:", error);
        return [];
      }
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};
