import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { TeamInvitation } from '@/types/team';

export const useTeamManagement = () => {
  const [userRole, setUserRole] = useState<'agent' | 'manager' | null>(null);
  const [teamInvitations, setTeamInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserRole();
    loadTeamInvitations();
  }, []);

  const loadUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserRole(profile?.role || null);
    } catch (error) {
      console.error('Error loading user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadTeamInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('invitee_id', user.id)
        .eq('status', 'pending');

      if (error) throw error;
      setTeamInvitations(data);
    } catch (error) {
      console.error('Error loading team invitations:', error);
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      const { error: updateError } = await supabase
        .from('team_invitations')
        .update({ status: 'accepted' })
        .eq('id', invitationId);

      if (updateError) throw updateError;

      const { data: invitation } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('id', invitationId)
        .single();

      if (invitation) {
        const { error: memberError } = await supabase
          .from('team_members')
          .insert({
            team_id: invitation.team_id,
            user_id: invitation.invitee_id,
            role: 'agent'
          });

        if (memberError) throw memberError;
      }

      toast({
        title: "Success",
        description: "You've joined the team successfully",
      });

      loadTeamInvitations();
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast({
        title: "Error",
        description: "Failed to accept invitation",
        variant: "destructive",
      });
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .update({ status: 'declined' })
        .eq('id', invitationId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Invitation declined successfully",
      });

      loadTeamInvitations();
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast({
        title: "Error",
        description: "Failed to decline invitation",
        variant: "destructive",
      });
    }
  };

  const leaveTeam = async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "You've left the team successfully",
      });
    } catch (error) {
      console.error('Error leaving team:', error);
      toast({
        title: "Error",
        description: "Failed to leave team",
        variant: "destructive",
      });
    }
  };

  return {
    userRole,
    teamInvitations,
    isLoading,
    acceptInvitation,
    declineInvitation,
    leaveTeam,
  };
};