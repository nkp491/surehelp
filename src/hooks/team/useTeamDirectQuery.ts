
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Team } from "@/types/team";

/**
 * Hook to fetch teams directly using secure database functions
 */
export const useTeamDirectQuery = (userId?: string) => {
  return useQuery({
    queryKey: ['direct-teams', userId],
    queryFn: async () => {
      try {
        if (!userId) {
          const { data: { user } } = await supabase.auth.getUser();
          userId = user?.id;
        }
        
        if (!userId) return [];
        
        console.log("Fetching teams directly for user:", userId);
        
        // Use the secure function to get user teams
        const { data: teamIds, error: teamIdsError } = await supabase.rpc(
          'get_user_teams_secure',
          { check_user_id: userId }
        );
        
        if (teamIdsError) {
          console.error("Error fetching user team IDs:", teamIdsError);
          // Fall back to direct query
          return await fetchTeamsDirectly(userId);
        }
        
        if (!teamIds || teamIds.length === 0) {
          console.log("No teams found for user");
          return [];
        }
        
        // Get team details for all team IDs
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds);
          
        if (teamsError) {
          console.error("Error fetching team details:", teamsError);
          return await fetchTeamsDirectly(userId);
        }
        
        // Ensure all required fields exist
        const userTeams = teams.map((team: any) => ({
          ...team,
          // Ensure updated_at exists since it's required by the Team type
          updated_at: team.updated_at || team.created_at
        }));
        
        console.log("User teams found:", userTeams.length);
        return userTeams as Team[];
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

/**
 * Fallback function to fetch teams directly from the database
 * Used when RPC calls fail
 */
const fetchTeamsDirectly = async (userId: string): Promise<Team[]> => {
  console.log("Using fallback direct teams query for user:", userId);
  
  try {
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
      return [];
    }
    
    if (!memberships || memberships.length === 0) {
      console.log("No team memberships found for user");
      return [];
    }
    
    // Filter teams by membership and ensure all required fields are present
    const teamIds = memberships.map(m => m.team_id);
    const userTeams = allTeams
      .filter((team: Team) => teamIds.includes(team.id))
      .map((team: any) => ({
        ...team,
        // Ensure updated_at exists since it's required by the Team type
        updated_at: team.updated_at || team.created_at
      }));
    
    console.log("User teams found via direct query:", userTeams.length);
    return userTeams as Team[];
  } catch (error) {
    console.error("Error in fallback direct teams query:", error);
    return [];
  }
};
