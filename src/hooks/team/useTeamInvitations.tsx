import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TeamInvitation, InvitationStatus } from "@/types/team";
import { useToast } from "@/hooks/use-toast";
import { useTeamCreation } from "./useTeamCreation";

export const useTeamInvitations = () => {
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const { toast } = useToast();
  const { createTeamIfNeeded } = useTeamCreation();

  const loadInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const teamId = await createTeamIfNeeded(user.id);
      if (!teamId) {
        throw new Error('Failed to get or create team');
      }

      const { data: invitationsData, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamId)
        .eq('status', 'pending');

      if (error) throw error;
      
      const typedInvitations = (invitationsData || []).map(inv => ({
        ...inv,
        status: (inv.status || 'pending') as InvitationStatus
      })) as TeamInvitation[];
      
      setInvitations(typedInvitations);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    }
  };

  const handleInviteMember = async (email: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const teamId = await createTeamIfNeeded(user.id);
      if (!teamId) {
        throw new Error('Failed to get or create team');
      }

      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      const { error: inviteError } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamId,
          inviter_id: user.id,
          invitee_id: userData?.id || null,
          invitee_email: email,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      loadInvitations();
    } catch (error: any) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to send invitation",
        variant: "destructive",
      });
    }
  };

  const handleCancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'cancelled' as InvitationStatus })
        .eq('id', invitationId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Invitation cancelled successfully",
      });

      loadInvitations();
    } catch (error) {
      console.error('Error cancelling invitation:', error);
      toast({
        title: "Error",
        description: "Failed to cancel invitation",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    loadInvitations();
  }, []);

  return {
    invitations,
    handleInviteMember,
    handleCancelInvitation,
  };
};