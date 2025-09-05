
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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if user is system admin
      const { data: adminRoles, error: adminError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "system_admin");

      if (adminError) {
        console.error("Error checking admin role:", adminError);
        throw adminError;
      }

      const isSystemAdmin = adminRoles && adminRoles.length > 0;

      let teamsResult;
      if (isSystemAdmin) {
        // System admin can see all teams
        teamsResult = await supabase
          .from('teams')
          .select('*')
          .order('name');
      } else {
        // Check if user is a manager
        const { data: managerRoles, error: managerError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .in("role", ["manager", "manager_pro", "manager_pro_gold", "manager_pro_platinum"]);

        if (managerError) {
          console.error("Error checking manager role:", managerError);
          throw managerError;
        }

        if (!managerRoles || managerRoles.length === 0) {
          // User is not a manager, return empty array
          return [];
        }

        // Get teams managed by this user
        const { data: managedTeams, error: managedTeamsError } = await supabase
          .from("team_managers")
          .select("team_id")
          .eq("user_id", user.id);

        if (managedTeamsError) {
          console.error("Error fetching managed teams:", managedTeamsError);
          throw managedTeamsError;
        }

        if (!managedTeams || managedTeams.length === 0) {
          // User is a manager but has no teams assigned
          return [];
        }

        const teamIds = managedTeams.map(tm => tm.team_id);
        teamsResult = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .order('name');
      }

      if (teamsResult.error) throw teamsResult.error;
      return teamsResult.data as Team[];
    },
  });

  // Create a new team
  const createTeam = useMutation({
    mutationFn: async (name: string) => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Insert the new team
      const { data, error } = await supabase
        .from('teams')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;

      // Add the creator as a team manager
      const { data: userRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      // Find the highest manager role the user has
      const managerRoles = userRoles
        ?.filter(ur => ur.role.startsWith('manager_pro'))
        .map(ur => ur.role) || ['manager_pro'];
      
      const highestRole = managerRoles.length > 0 ? managerRoles[0] : 'manager_pro';

      const { error: memberError } = await supabase
        .from('team_members')
        .insert([{
          team_id: data.id,
          user_id: user.id,
          role: highestRole
        }]);

      if (memberError) throw memberError;

      return data;
    },
    onSuccess: () => {
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

  return {
    teams: fetchTeams.data,
    isLoadingTeams: fetchTeams.isLoading,
    createTeam,
    updateTeam,
    isLoading
  };
};
