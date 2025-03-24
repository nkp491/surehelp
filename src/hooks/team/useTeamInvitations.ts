
import { useCallback, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TeamInvitation, InvitationStatus } from "@/types/team";

export const useTeamInvitations = (teamId?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [userInvitations, setUserInvitations] = useState<TeamInvitation[]>([]);
  const [isLoadingTeamInvitations, setIsLoadingTeamInvitations] = useState(false);
  const [isLoadingUserInvitations, setIsLoadingUserInvitations] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch invitations for a specific team
  const fetchInvitations = useCallback(async (teamId: string) => {
    if (!teamId) return [];

    const { data, error } = await supabase
      .from("team_invitations")
      .select(`
        *,
        team:team_id (
          name
        ),
        invited_by_profile:invited_by (
          first_name,
          last_name,
          profile_image_url
        ),
        user_profile:user_id (
          first_name,
          last_name
        )
      `)
      .eq("team_id", teamId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching team invitations:", error);
      throw error;
    }

    // Process the data to handle nullable fields and ensure proper structure
    return data.map(invitation => {
      // Use nullish coalescing to ensure we have objects even if the data is null
      const team = invitation.team || {}; 
      const invitedByProfile = invitation.invited_by_profile || {};
      const userProfile = invitation.user_profile || {};
      
      return {
        ...invitation,
        team_name: team?.name || 'Unknown team',
        invited_by_name: invitedByProfile?.first_name && invitedByProfile?.last_name 
          ? `${invitedByProfile.first_name} ${invitedByProfile.last_name}`.trim() 
          : 'Unknown user',
        invited_by_profile_image: invitedByProfile?.profile_image_url || '',
        user_name: userProfile?.first_name && userProfile?.last_name 
          ? `${userProfile.first_name} ${userProfile.last_name}` 
          : 'Unknown user',
        status: invitation.status as InvitationStatus
      } as TeamInvitation;
    });
  }, []);

  // Fetch invitations for the current user
  const fetchUserInvitations = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("team_invitations")
      .select(`
        *,
        team:team_id (
          name
        ),
        invited_by_profile:invited_by (
          first_name,
          last_name,
          profile_image_url
        )
      `)
      .eq("user_id", user.id)
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user invitations:", error);
      throw error;
    }

    // Process the data to handle nullable fields and ensure proper structure
    return data.map(invitation => {
      // Use nullish coalescing to ensure we have objects even if the data is null
      const team = invitation.team || {}; 
      const invitedByProfile = invitation.invited_by_profile || {};
      
      return {
        ...invitation,
        team_name: team?.name || 'Unknown team',
        invited_by_name: invitedByProfile?.first_name && invitedByProfile?.last_name 
          ? `${invitedByProfile.first_name} ${invitedByProfile.last_name}`.trim() 
          : 'Unknown user',
        invited_by_profile_image: invitedByProfile?.profile_image_url || '',
        inviter_name: invitedByProfile?.first_name && invitedByProfile?.last_name
          ? `${invitedByProfile.first_name} ${invitedByProfile.last_name}`.trim()
          : 'Unknown user',
        inviter_image: invitedByProfile?.profile_image_url || '',
        status: invitation.status as InvitationStatus
      } as TeamInvitation;
    });
  }, []);

  // Explicit refresh functions
  const refreshTeamInvitations = useCallback(async () => {
    if (!teamId) return [];
    setIsLoadingTeamInvitations(true);
    try {
      const invitations = await fetchInvitations(teamId);
      setTeamInvitations(invitations as TeamInvitation[]);
      return invitations;
    } catch (error) {
      console.error("Error refreshing team invitations:", error);
      return [];
    } finally {
      setIsLoadingTeamInvitations(false);
    }
  }, [teamId, fetchInvitations]);

  const refreshUserInvitations = useCallback(async () => {
    setIsLoadingUserInvitations(true);
    try {
      const invitations = await fetchUserInvitations();
      setUserInvitations(invitations as TeamInvitation[]);
      return invitations;
    } catch (error) {
      console.error("Error refreshing user invitations:", error);
      return [];
    } finally {
      setIsLoadingUserInvitations(false);
    }
  }, [fetchUserInvitations]);

  // Create a new invitation
  const createInvitation = async ({ teamId, email, role }: { teamId: string, email: string, role: string }) => {
    if (!teamId) throw new Error("Team ID is required");

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("You must be logged in to invite users");

    // Check if the email exists in profiles
    const { data: profileData } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .single();

    const userId = profileData?.id;

    const { data, error } = await supabase
      .from("team_invitations")
      .insert({
        team_id: teamId,
        user_id: userId,
        email: email,
        invited_by: user.id,
        role,
        status: "pending"
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        throw new Error("An invitation for this user already exists");
      }
      throw error;
    }

    return data;
  };

  // Accept an invitation
  const acceptInvitation = async (invitationId: string) => {
    const { data: invitation, error: fetchError } = await supabase
      .from("team_invitations")
      .select("*")
      .eq("id", invitationId)
      .single();

    if (fetchError) throw fetchError;
    if (!invitation) throw new Error("Invitation not found");

    // First, update the invitation status
    const { error: updateError } = await supabase
      .from("team_invitations")
      .update({ status: "accepted" })
      .eq("id", invitationId);

    if (updateError) throw updateError;

    // Then, add the user to the team
    const { error: teamMemberError } = await supabase
      .from("team_members")
      .insert({
        team_id: invitation.team_id,
        user_id: invitation.user_id,
        role: invitation.role
      });

    if (teamMemberError) {
      // If adding to team fails, revert invitation status
      await supabase
        .from("team_invitations")
        .update({ status: "pending" })
        .eq("id", invitationId);
      
      throw teamMemberError;
    }

    return invitation;
  };

  // Decline an invitation
  const declineInvitation = async (invitationId: string) => {
    const { data, error } = await supabase
      .from("team_invitations")
      .update({ status: "declined" })
      .eq("id", invitationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Cancel an invitation
  const cancelInvitation = async (invitationId: string) => {
    const { data, error } = await supabase
      .from("team_invitations")
      .delete()
      .eq("id", invitationId)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  // Use React Query to handle data fetching
  const useTeamInvitationsQuery = () => {
    return useQuery({
      queryKey: ['team-invitations', teamId],
      queryFn: () => fetchInvitations(teamId!),
      enabled: !!teamId,
      meta: {
        onSuccess: (data: any) => {
          setTeamInvitations(data as TeamInvitation[]);
        }
      }
    });
  };

  const useUserInvitationsQuery = () => {
    return useQuery({
      queryKey: ['user-invitations'],
      queryFn: fetchUserInvitations,
      meta: {
        onSuccess: (data: any) => {
          setUserInvitations(data as TeamInvitation[]);
        }
      }
    });
  };

  // Update invitation status (accept or decline)
  const updateInvitationStatus = useMutation({
    mutationFn: async ({ invitationId, status }: { invitationId: string, status: "accepted" | "declined" }) => {
      if (status === "accepted") {
        return await acceptInvitation(invitationId);
      } else {
        return await declineInvitation(invitationId);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-invitations'] });
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      toast({
        title: "Invitation updated",
        description: "The invitation status has been updated",
      });
      refreshUserInvitations();
    },
    onError: (error: any) => {
      toast({
        title: "Error updating invitation",
        description: error.message || "There was an error updating the invitation",
        variant: "destructive"
      });
    }
  });

  // Use React Query mutations for actions
  const createInvitationMutation = useMutation({
    mutationFn: createInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', teamId] });
      toast({
        title: "Invitation sent",
        description: "The user has been invited to join the team",
      });
      refreshTeamInvitations();
    },
    onError: (error: any) => {
      toast({
        title: "Error sending invitation",
        description: error.message || "There was an error sending the invitation",
        variant: "destructive"
      });
    }
  });

  const deleteInvitationMutation = useMutation({
    mutationFn: cancelInvitation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-invitations', teamId] });
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled",
      });
      refreshTeamInvitations();
    },
    onError: (error: any) => {
      toast({
        title: "Error cancelling invitation",
        description: error.message || "There was an error cancelling the invitation",
        variant: "destructive"
      });
    }
  });

  return {
    // Data
    teamInvitations,
    userInvitations,
    isLoadingTeamInvitations,
    isLoadingUserInvitations,
    isLoading,
    
    // Refresh functions
    refreshTeamInvitations,
    refreshUserInvitations,
    
    // Query hooks
    useTeamInvitationsQuery,
    useUserInvitationsQuery,
    
    // Mutation hooks
    createInvitation: createInvitationMutation,
    updateInvitationStatus,
    deleteInvitation: deleteInvitationMutation,
    
    // Raw functions for direct use
    fetchInvitations,
    fetchUserInvitations,
    acceptInvitation,
    declineInvitation,
    cancelInvitation
  };
};
