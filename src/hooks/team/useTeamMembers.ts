
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamMember } from "@/types/team";

/**
 * Hook to fetch and manage team members
 */
export const useTeamMembers = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

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
  const { data: members, ...queryResult } = useQuery({
    queryKey: ['team-members', teamId],
    queryFn: () => getTeamMembers(teamId!),
    enabled: !!teamId,
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

  return {
    members,
    getTeamMembers,
    fetchTeamMembers: (teamId?: string) => ({ data: members, ...queryResult }),
    addTeamMember,
    removeTeamMember,
    updateTeamMemberRole,
    isLoading
  };
};
