
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamInvitation, InvitationStatus } from "@/types/team";

export const useTeamInvitations = (teamId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  // Get all invitations for a team
  const fetchTeamInvitations = async (teamId: string) => {
    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams:team_id (name),
        inviters:invited_by (
          id,
          first_name,
          last_name,
          profile_image_url
        ),
        invitees:user_id (
          id,
          first_name,
          last_name,
          email
        )
      `)
      .eq('team_id', teamId);

    if (error) throw error;

    // Transform data to include nested properties
    return data.map(invitation => ({
      ...invitation,
      team_name: invitation.teams?.name,
      inviter_name: `${invitation.inviters?.first_name || ''} ${invitation.inviters?.last_name || ''}`.trim(),
      inviter_image: invitation.inviters?.profile_image_url,
      invitee_name: invitation.invitees ? 
        `${invitation.invitees.first_name || ''} ${invitation.invitees.last_name || ''}`.trim() : 
        null
    })) as TeamInvitation[];
  };

  // Get user's pending invitations
  const fetchUserInvitations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Get user's profile to access email
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('id', user.id)
      .single();

    if (profileError) throw profileError;

    // Fetch invitations by user ID and email
    const { data, error } = await supabase
      .from('team_invitations')
      .select(`
        *,
        teams:team_id (name),
        inviters:invited_by (
          id,
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .or(`user_id.eq.${user.id},email.eq.${profile.email}`)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform data
    return data.map(invitation => ({
      ...invitation,
      team_name: invitation.teams?.name,
      inviter_name: `${invitation.inviters?.first_name || ''} ${invitation.inviters?.last_name || ''}`.trim(),
      inviter_image: invitation.inviters?.profile_image_url
    })) as TeamInvitation[];
  };

  // Team invitations query
  const teamInvitationsQuery = useQuery({
    queryKey: ['team-invitations', teamId],
    queryFn: () => fetchTeamInvitations(teamId!),
    enabled: !!teamId,
  });

  // User invitations query
  const userInvitationsQuery = useQuery({
    queryKey: ['user-invitations'],
    queryFn: fetchUserInvitations,
  });

  // Create new invitation
  const createInvitation = useMutation({
    mutationFn: async ({ 
      teamId, 
      email, 
      userId, 
      role 
    }: { 
      teamId: string; 
      email?: string; 
      userId?: string; 
      role: string; 
    }) => {
      setIsLoading(true);
      
      // Validate that either email or userId is provided
      if (!email && !userId) {
        throw new Error('Either email or userId is required');
      }
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const invitation = {
        team_id: teamId,
        invited_by: user.id,
        role,
        status: 'pending' as InvitationStatus
      };
      
      if (email) {
        Object.assign(invitation, { email });
      } else if (userId) {
        Object.assign(invitation, { user_id: userId });
      }
      
      const { data, error } = await supabase
        .from('team_invitations')
        .insert([invitation])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', variables.teamId] });
      toast({
        title: "Invitation sent",
        description: "The invitation has been sent successfully."
      });
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error sending invitation:', error);
      toast({
        title: "Error",
        description: "There was a problem sending the invitation. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  });

  // Update invitation status
  const updateInvitationStatus = useMutation({
    mutationFn: async ({ 
      invitationId, 
      status 
    }: { 
      invitationId: string; 
      status: InvitationStatus; 
    }) => {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('team_invitations')
        .update({ status })
        .eq('id', invitationId)
        .select()
        .single();
      
      if (error) throw error;
      
      // If accepting invitation, add the user to the team
      if (status === 'accepted') {
        // Get the invitation details
        const invitation = data as TeamInvitation;
        
        // Add user to team
        if (invitation.user_id) {
          const { error: teamMemberError } = await supabase
            .from('team_members')
            .insert([{
              team_id: invitation.team_id,
              user_id: invitation.user_id,
              role: invitation.role
            }]);
          
          if (teamMemberError) throw teamMemberError;
        } else {
          // Handle email-based invites when user accepts after registration
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('User not authenticated');
          
          // Get user's profile to check email
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('email')
            .eq('id', user.id)
            .single();
          
          if (profileError) throw profileError;
          
          // Verify this invitation is for the current user's email
          if (profile.email === invitation.email) {
            const { error: teamMemberError } = await supabase
              .from('team_members')
              .insert([{
                team_id: invitation.team_id,
                user_id: user.id,
                role: invitation.role
              }]);
            
            if (teamMemberError) throw teamMemberError;
          } else {
            throw new Error('Email mismatch: This invitation was not sent to your email address');
          }
        }
      }
      
      return data;
    },
    onSuccess: (data) => {
      // Invalidate multiple queries to ensure UI is updated
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      
      const statusMessages = {
        accepted: "You have successfully joined the team.",
        declined: "You have declined the invitation.",
        expired: "The invitation has been marked as expired."
      };
      
      toast({
        title: data.status === 'accepted' ? "Team Joined" : "Invitation Updated",
        description: statusMessages[data.status as keyof typeof statusMessages] || "Invitation status updated."
      });
      
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error updating invitation:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "There was a problem updating the invitation. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  });

  // Delete invitation
  const deleteInvitation = useMutation({
    mutationFn: async (invitationId: string) => {
      setIsLoading(true);
      
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      
      toast({
        title: "Invitation Canceled",
        description: "The invitation has been canceled."
      });
      
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Error deleting invitation:', error);
      toast({
        title: "Error",
        description: "There was a problem canceling the invitation. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  });

  return {
    // Queries
    teamInvitations: teamInvitationsQuery.data,
    isLoadingTeamInvitations: teamInvitationsQuery.isLoading,
    refreshTeamInvitations: () => queryClient.invalidateQueries({ queryKey: ['team-invitations', teamId] }),
    
    userInvitations: userInvitationsQuery.data,
    isLoadingUserInvitations: userInvitationsQuery.isLoading,
    refreshUserInvitations: () => queryClient.invalidateQueries({ queryKey: ['user-invitations'] }),
    
    // Mutations
    createInvitation,
    updateInvitationStatus,
    deleteInvitation,
    
    // Loading state
    isLoading
  };
};
