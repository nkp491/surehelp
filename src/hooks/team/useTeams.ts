
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
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        // First get team_members for this user
        const { data: teamMembers, error: membersError } = await supabase
          .from('team_members')
          .select('team_id')
          .eq('user_id', user.id);
          
        if (membersError) {
          console.error("Error fetching team memberships:", membersError);
          throw membersError;
        }
        
        if (!teamMembers || teamMembers.length === 0) {
          console.log("User has no team memberships");
          return [];
        }
        
        // Get the team IDs
        const teamIds = teamMembers.map(tm => tm.team_id);
        
        // Get the team details
        const { data: teams, error: teamsError } = await supabase
          .from('teams')
          .select('*')
          .in('id', teamIds)
          .order('name');
          
        if (teamsError) {
          console.error("Error fetching teams:", teamsError);
          throw teamsError;
        }

        console.log("Teams fetched:", teams?.length || 0);
        return teams as Team[];
      } catch (error) {
        console.error("Error in fetchTeams:", error);
        return [];
      }
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
        
        // First, create the team
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert([{ name }])
          .select()
          .single();
          
        if (teamError) {
          console.error("Error creating team:", teamError);
          throw teamError;
        }
        
        console.log("Team created:", teamData);
        
        // Now add the user as a manager of this team
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .or('role.eq.manager_pro,role.eq.manager_pro_gold,role.eq.manager_pro_platinum');
        
        // Determine the manager role to use - use the first manager role found or default to manager_pro
        let managerRole = 'manager_pro';
        if (userRoles && userRoles.length > 0) {
          const managerRoles = userRoles.filter(r => 
            r.role === 'manager_pro' || 
            r.role === 'manager_pro_gold' || 
            r.role === 'manager_pro_platinum'
          );
          if (managerRoles.length > 0) {
            managerRole = managerRoles[0].role;
          }
        }
        
        const { error: memberError } = await supabase
          .from('team_members')
          .insert([{
            team_id: teamData.id,
            user_id: user.id,
            role: managerRole
          }]);
          
        if (memberError) {
          console.error("Error adding user to team:", memberError);
          throw memberError;
        }
        
        // Now add all users who have this manager as their manager to the team
        const { data: managedUsers, error: managedError } = await supabase
          .from('profiles')
          .select('id')
          .eq('manager_id', user.id);
          
        if (managedError) {
          console.error("Error fetching managed users:", managedError);
          // Non-critical error, continue
        } else if (managedUsers && managedUsers.length > 0) {
          // Add each managed user to the team
          const teamMembers = managedUsers.map(u => ({
            team_id: teamData.id,
            user_id: u.id,
            role: 'agent' // Default role for team members
          }));
          
          const { error: bulkAddError } = await supabase
            .from('team_members')
            .insert(teamMembers);
            
          if (bulkAddError) {
            console.error("Error adding managed users to team:", bulkAddError);
            // Non-critical error, continue
          } else {
            console.log(`Added ${managedUsers.length} managed users to team`);
          }
        }
        
        return teamData;
      } catch (error) {
        console.error("Error in createTeam mutation:", error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log("Team creation success:", data);
      // Invalidate the teams query to refetch
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
      
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
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
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

  // Add user to team
  const addUserToTeam = useMutation({
    mutationFn: async ({ teamId, userId, role }: { teamId: string; userId: string; role: string }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('team_members')
        .insert([{
          team_id: teamId,
          user_id: userId,
          role
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user-teams'] });
      queryClient.invalidateQueries({ queryKey: ['user-teams-profile'] });
      queryClient.invalidateQueries({ queryKey: ['team-members', data.team_id] });
      toast({
        title: "User added to team",
        description: "The user has been added to the team successfully.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error adding user to team:', error);
      toast({
        title: "Error",
        description: "There was a problem adding the user to the team. Please try again.",
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
    addUserToTeam,
    refetchTeams,
    isLoading
  };
};
