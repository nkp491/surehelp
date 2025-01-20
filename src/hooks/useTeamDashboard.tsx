import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamInvitation, InvitationStatus } from "@/types/team";
import { useToast } from "@/hooks/use-toast";

export const useTeamDashboard = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const createTeamIfNeeded = async (userId: string) => {
    // Check if user already has a team as manager
    const { data: existingTeam } = await supabase
      .from('team_members')
      .select('team_id')
      .eq('user_id', userId)
      .eq('role', 'manager')
      .single();

    if (!existingTeam) {
      // Get user's profile for team name
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name')
        .eq('id', userId)
        .single();

      // Create new team
      const { data: newTeam, error: teamError } = await supabase
        .from('teams')
        .insert([
          { name: `${profile?.first_name || 'New'}'s Team` }
        ])
        .select()
        .single();

      if (teamError) {
        console.error('Error creating team:', teamError);
        return null;
      }

      // Add user as team manager
      const { error: memberError } = await supabase
        .from('team_members')
        .insert([
          {
            team_id: newTeam.id,
            user_id: userId,
            role: 'manager'
          }
        ]);

      if (memberError) {
        console.error('Error adding team member:', memberError);
        return null;
      }

      return newTeam.id;
    }

    return existingTeam.team_id;
  };

  const loadTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      if (profileData?.role !== 'manager') {
        setIsLoading(false);
        return;
      }

      // Ensure user has a team
      const teamId = await createTeamIfNeeded(user.id);
      if (!teamId) {
        throw new Error('Failed to get or create team');
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
        .eq('team_id', teamId);

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
