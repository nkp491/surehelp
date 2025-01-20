import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamInvitation, InvitationStatus } from "@/types/team";
import { useToast } from "@/hooks/use-toast";

export const useTeamDashboard = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);

      if (!user) {
        console.error('No user found');
        return;
      }

      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('role', 'manager')
        .single();

      console.log('Team data:', teamData, 'Team error:', teamError);

      if (teamError) {
        console.error('Error fetching team:', teamError);
        return;
      }

      if (!teamData?.team_id) {
        console.log('No team found for manager');
        setTeamMembers([]);
        return;
      }

      const { data: membersData, error: membersError } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .eq('team_id', teamData.team_id);

      console.log('Members data:', membersData, 'Members error:', membersError);

      if (membersError) throw membersError;

      const membersWithProfiles = (membersData || []).map(member => ({
        ...member,
        profile: member.profiles || {
          first_name: null,
          last_name: null,
          email: null
        }
      }));

      const membersWithMetrics = await Promise.all(
        membersWithProfiles.map(async (member) => {
          const { data: metricsData } = await supabase
            .from('daily_metrics')
            .select('*')
            .eq('user_id', member.user_id)
            .order('date', { ascending: false })
            .limit(1)
            .single();

          return {
            ...member,
            metrics: metricsData || {
              leads: null,
              calls: null,
              contacts: null,
              scheduled: null,
              sits: null,
              sales: null,
              ap: null
            }
          } as TeamMember;
        })
      );

      setTeamMembers(membersWithMetrics);
    } catch (error) {
      console.error('Error loading team members:', error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvitations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: teamData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('role', 'manager')
        .single();

      console.log('Team data for invitations:', teamData);

      if (!teamData?.team_id) {
        console.log('No team found for invitations');
        return;
      }

      const { data: invitationsData, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('team_id', teamData.team_id)
        .eq('status', 'pending');

      console.log('Invitations data:', invitationsData, 'Error:', error);

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
      console.log('Inviting member with email:', email);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { data: teamData, error: teamError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id)
        .eq('role', 'manager')
        .single();

      console.log('Team data for invitation:', teamData, 'Team error:', teamError);

      if (teamError || !teamData?.team_id) {
        throw new Error('Failed to get team information');
      }

      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      console.log('User data for invitation:', userData);

      const { error: inviteError } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamData.team_id,
          inviter_id: user.id,
          invitee_id: userData?.id || null,
          invitee_email: email,
          status: 'pending'
        });

      console.log('Invitation error:', inviteError);

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      loadInvitations();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation. Please ensure you have manager permissions.",
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Team member removed successfully",
      });

      loadTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: "Error",
        description: "Failed to remove team member",
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
    loadTeamMembers();
    loadInvitations();
  }, []);

  return {
    teamMembers,
    invitations,
    isLoading,
    handleInviteMember,
    handleRemoveMember,
    handleCancelInvitation,
  };
};