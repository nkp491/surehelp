
import { useState } from "react";
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
  const fetchTeams = useQuery({
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

        // Get teams directly with a simpler query to avoid recursion
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .order('name');
        
        if (error) {
          console.error("Database error when fetching teams:", error);
          throw error;
        }
        
        console.log("Teams fetched:", data);
        return data as Team[];
      } catch (error: any) {
        console.error("Error in fetchTeams:", error);
        throw error;
      }
    },
    retry: 1,
  });

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

        // Insert the new team
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert([{ name }])
          .select()
          .single();

        if (teamError) {
          console.error("Error inserting team:", teamError);
          throw teamError;
        }
        
        console.log("Team created:", teamData);

        // Add the creator as a team member with explicit values to avoid recursion
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{
            team_id: teamData.id,
            user_id: user.id,
            role: 'manager_pro'
          }]);

        if (memberError) {
          console.error("Error adding team member:", memberError);
          throw memberError;
        }

        console.log("Team member added successfully");
        return teamData;
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
    teams: fetchTeams.data,
    isLoadingTeams: fetchTeams.isLoading,
    createTeam,
    updateTeam,
    isLoading
  };
};
