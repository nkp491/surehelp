
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Team } from "@/types/team";

/**
 * Hook to fetch and manage teams
 */
export const useTeams = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get teams the current user belongs to
  const fetchTeams = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      console.log("Fetching user teams...");
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) {
        console.error("Error fetching teams:", error);
        throw error;
      }
      
      console.log("Teams fetched:", data?.length || 0);
      return data as Team[];
    },
  });

  // Create a new team
  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      setIsLoading(true);
      console.log("Creating new team:", name);
      
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
  
        // Use the Supabase function to create a team and add the user as a member
        const { data, error } = await supabase.rpc('create_team_with_member', {
          team_name: name
        });
  
        if (error) {
          console.error("Error creating team with RPC:", error);
          throw error;
        }
  
        console.log("Team created successfully:", data);
        return data;
      } catch (error) {
        console.error("Error in createTeam mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Team creation success:", data);
      // Invalidate the teams query to refetch
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      
      toast({
        title: "Team created",
        description: "Your new team has been created successfully.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error creating team:', error);
      toast({
        title: "Error",
        description: "There was a problem creating the team. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Update team name
  const updateTeam = useMutation({
    mutationFn: async ({ teamId, name }: { teamId: string; name: string }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('teams')
        .update({ name })
        .eq('id', teamId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      toast({
        title: "Team updated",
        description: "The team has been updated successfully.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error updating team:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the team. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Expose the refetch function
  const refetchTeams = async () => {
    console.log("Manually refetching teams...");
    return await fetchTeams.refetch();
  };

  return {
    teams: fetchTeams.data,
    isLoadingTeams: fetchTeams.isLoading,
    createTeam,
    updateTeam,
    refetchTeams,
    isLoading
  };
};
