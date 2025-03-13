
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Team, TeamMember } from "@/types/team";

export const useTeamManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get teams the current user belongs to
  const { data: teams, isLoading: isLoadingTeams } = useQuery({
    queryKey: ['user-teams'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (error) throw error;
      return data as Team[];
    },
  });

  // Get team members with their profile information
  const getTeamMembers = async (teamId: string) => {
    // First, fetch the team members
    const { data: members, error: membersError } = await supabase
      .from('team_members')
      .select('*')
      .eq('team_id', teamId);

    if (membersError) throw membersError;

    // Get the list of user IDs to fetch their profiles
    const userIds = members.map(member => member.user_id);
    
    // Fetch the profiles for these users
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, profile_image_url')
      .in('id', userIds);
    
    if (profilesError) throw profilesError;

    // Create a map of user IDs to their profile information
    const profileMap = profiles.reduce((acc, profile) => {
      acc[profile.id] = profile;
      return acc;
    }, {} as Record<string, any>);

    // Merge the team members with their profile information
    return members.map((member) => ({
      ...member,
      first_name: profileMap[member.user_id]?.first_name,
      last_name: profileMap[member.user_id]?.last_name,
      email: profileMap[member.user_id]?.email,
      profile_image_url: profileMap[member.user_id]?.profile_image_url,
    })) as TeamMember[];
  };

  // Query for team members
  const useTeamMembers = (teamId?: string) => {
    return useQuery({
      queryKey: ['team-members', teamId],
      queryFn: () => getTeamMembers(teamId!),
      enabled: !!teamId,
    });
  };

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

  // Add member to team
  const addTeamMember = useMutation({
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
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] });
      toast({
        title: "Member added",
        description: "The user has been added to the team.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error adding team member:', error);
      toast({
        title: "Error",
        description: "There was a problem adding the team member. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Remove member from team
  const removeTeamMember = useMutation({
    mutationFn: async ({ teamId, memberId }: { teamId: string; memberId: string }) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;
      return { success: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] });
      toast({
        title: "Member removed",
        description: "The user has been removed from the team.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error removing team member:', error);
      toast({
        title: "Error",
        description: "There was a problem removing the team member. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Update team member role
  const updateTeamMemberRole = useMutation({
    mutationFn: async ({ teamId, memberId, role }: { teamId: string; memberId: string; role: string }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('team_members')
        .update({ role })
        .eq('id', memberId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-members', variables.teamId] });
      toast({
        title: "Role updated",
        description: "The team member's role has been updated.",
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error updating team member role:', error);
      toast({
        title: "Error",
        description: "There was a problem updating the role. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  });

  // Check if user is team manager
  const isTeamManager = async (teamId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('team_members')
      .select('role')
      .eq('team_id', teamId)
      .eq('user_id', user.id)
      .single();

    if (error || !data) return false;
    return data.role.startsWith('manager_pro');
  };

  return {
    teams,
    isLoadingTeams,
    isLoading,
    useTeamMembers,
    createTeam,
    updateTeam,
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    isTeamManager
  };
};
