
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

  // Get teams the current user belongs to
  const fetchTeamsQuery = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      try {
        console.log("Fetching teams...");
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error when fetching teams:", authError);
          throw new Error(`Authentication error: ${getErrorMessage(authError)}`);
        }
        
        if (!user) {
          console.error("No authenticated user found");
          throw new Error('User not authenticated');
        }

        console.log("Auth successful, user ID:", user.id);

        // First, get team IDs the user belongs to
        const { data: teamMemberships, error: membershipError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);

        if (membershipError) {
          console.error("Error fetching team memberships:", membershipError);
          throw membershipError;
        }

        if (!teamMemberships || teamMemberships.length === 0) {
          console.log("User doesn't belong to any teams");
          return [];
        }

        const teamIds = teamMemberships.map(membership => membership.team_id);
        console.log("User belongs to team IDs:", teamIds);

        // Get the actual team data
        const { data: teamsData, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .order('name');
        
        if (teamsError) {
          console.error("Database error when fetching teams:", teamsError);
          throw teamsError;
        }
        
        console.log("Teams fetched:", teamsData);
        return teamsData as Team[];
      } catch (error: any) {
        console.error("Error in fetchTeams:", error);
        throw error;
      }
    },
    retry: 1,
  });

  // Function to manually refresh teams
  const refreshTeams = useCallback(async () => {
    try {
      console.log("Manually refreshing teams");
      await queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      return await queryClient.refetchQueries({ queryKey: ['user-teams'] });
    } catch (error) {
      console.error("Error refreshing teams:", error);
      throw error;
    }
  }, [queryClient]);

  // Create a new team
  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      try {
        setIsLoading(true);
        console.log("Creating team with name:", name);
        
        // Verify authentication
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError) {
          console.error("Auth error when creating team:", authError);
          throw new Error(`Authentication error: ${getErrorMessage(authError)}`);
        }
        
        if (!user) {
          console.error("No authenticated user found");
          throw new Error('User not authenticated');
        }

        console.log("User authenticated, proceeding with team creation");

        // Use a transaction to ensure both team and team_member are created
        // Correct approach: specify the function name as the type parameter
        const { data, error } = await supabase.rpc('create_team_with_member', { 
          team_name: name,
          member_role: 'manager_pro' 
        });

        if (error) {
          console.error("Error creating team with RPC:", error);
          throw error;
        }
        
        console.log("Team created with RPC:", data);
        return data as { id: string; name: string; created_at: string; updated_at: string };
      } catch (error) {
        console.error("Error in createTeam mutation:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    onSuccess: () => {
      console.log("Team creation successful, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
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
    createTeam,
    updateTeam,
    refreshTeams,
    isLoading
  };
};
