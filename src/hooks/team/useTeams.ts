
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

        // Get teams that the user is a member of through team_members
        const { data, error } = await supabase
          .from('team_members')
          .select('team_id, teams:team_id(id, name)')
          .eq('user_id', user.id);

        if (error) {
          console.error("Database error when fetching team members:", error);
          throw error;
        }
        
        // Extract teams from the result
        const teams = data.map(item => item.teams) as Team[];
        console.log("Teams fetched:", teams);
        return teams;
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

        // Add the creator as a team manager
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        if (rolesError) {
          console.error("Error fetching user roles:", rolesError);
          throw rolesError;
        }

        // Find the highest manager role the user has
        const managerRoles = userRoles
          ?.filter(ur => ur.role.startsWith('manager_pro'))
          .map(ur => ur.role) || ['manager_pro'];
        
        const highestRole = managerRoles.length > 0 ? managerRoles[0] : 'manager_pro';
        console.log("Adding user as team member with role:", highestRole);

        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{
            team_id: teamData.id,
            user_id: user.id,
            role: highestRole
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
      toast({
        title: "Team updated",
        description: "The team has been updated successfully.",
      });
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
