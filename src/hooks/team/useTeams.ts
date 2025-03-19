
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Team } from "@/types/team";
import { getErrorMessage } from "@/utils/authErrors";

/**
 * Hook to fetch and manage teams
 */
export const useTeams = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefreshError, setLastRefreshError] = useState<string | null>(null);
  const [isTeamMembersFetching, setIsTeamMembersFetching] = useState(false);

  // Get teams the current user belongs to
  const fetchTeamsQuery = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      try {
        console.log("Fetching teams...");
        setLastRefreshError(null);
        
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error when fetching teams:", authError);
          const errorMessage = `Authentication error: ${getErrorMessage(authError)}`;
          setLastRefreshError(errorMessage);
          throw new Error(errorMessage);
        }
        
        if (!user) {
          console.error("No authenticated user found");
          setLastRefreshError("User not authenticated");
          throw new Error('User not authenticated');
        }

        console.log("Auth successful, user ID:", user.id);

        // Use RPC instead of direct query to avoid recursion issues
        try {
          setIsTeamMembersFetching(true);
          // Get team IDs using our security definer function
          const { data: teamIds, error: teamIdsError } = await supabase.rpc('get_user_teams');
          
          if (teamIdsError) {
            console.error("Error fetching team IDs:", teamIdsError);
            setLastRefreshError(`Database error: ${teamIdsError.message}`);
            throw teamIdsError;
          }
          
          console.log("Team IDs fetched:", teamIds);
          
          if (!teamIds || teamIds.length === 0) {
            console.log("User doesn't belong to any teams");
            return [];
          }
          
          // Get the actual team data
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .in('id', teamIds)
            .order('name');
          
          if (teamsError) {
            console.error("Database error when fetching teams:", teamsError);
            setLastRefreshError(`Database error: ${teamsError.message}`);
            throw teamsError;
          }
          
          console.log("Teams fetched:", teamsData);
          return teamsData as Team[];
        } finally {
          setIsTeamMembersFetching(false);
        }
      } catch (error: any) {
        console.error("Error in fetchTeams:", error);
        setLastRefreshError(error.message || "Unknown error fetching teams");
        throw error;
      }
    },
    retry: 1,
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Function to manually refresh teams
  const refreshTeams = useCallback(async () => {
    try {
      console.log("Manually refreshing teams");
      await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      const result = await queryClient.refetchQueries({ queryKey: ['user-teams'] });
      console.log("Team refresh result:", result);
      setLastRefreshError(null);
      return result;
    } catch (error: any) {
      console.error("Error refreshing teams:", error);
      setLastRefreshError(error.message || "Unknown error refreshing teams");
      throw error;
    }
  }, [queryClient]);

  // Create a new team
  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      try {
        setIsLoading(true);
        console.log("Creating team with name:", name);
        
        // Use the create_team_with_member RPC function to create a team and add the user
        const { data, error } = await supabase.rpc('create_team_with_member', { 
          team_name: name,
          member_role: 'manager_pro' 
        });

        if (error) {
          console.error("Error creating team with RPC:", error);
          throw error;
        }
        
        console.log("Team created with RPC, result:", data);
        return data as { id: string; name: string; created_at: string; updated_at: string };
      } catch (error) {
        console.error("Error in createTeam mutation:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: async (data) => {
      console.log("Team creation successful, team data:", data);
      
      // Force an immediate refresh after creating a team
      await refreshTeams();
      console.log("Teams refreshed after creation");
      
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      });
    },
    onError: (error: any) => {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: error.message || "There was a problem creating the team. Please try again.",
        variant: "destructive",
      });
    }
  });

  // Update team name
  const updateTeam = useMutation({
    mutationFn: async ({ teamId, name }: { teamId: string; name: string }) => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('teams')
          .update({ name })
          .eq('id', teamId)
          .select()
          .single();

        if (error) throw error;
        return data;
      } catch (error) {
        console.error("Error in updateTeam mutation:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
    },
    onError: (error: any) => {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: error.message || "There was a problem updating the team. Please try again.",
        variant: "destructive",
      });
    }
  });

  return {
    teams: fetchTeamsQuery.data,
    isLoadingTeams: fetchTeamsQuery.isLoading || fetchTeamsQuery.isFetching,
    isTeamMembersFetching,
    createTeam,
    updateTeam,
    refreshTeams,
    isLoading,
    lastRefreshError
  };
};
