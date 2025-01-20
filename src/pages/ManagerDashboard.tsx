import { useState, useEffect } from 'react';
import { AlertCircle, Users, TrendingUp, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamInvitation, InvitationStatus } from "@/types/team";
import DashboardHeader from '@/components/manager/DashboardHeader';
import TeamMembersList from '@/components/manager/TeamMembersList';
import InvitationsList from '@/components/manager/InvitationsList';

const ManagerDashboard = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
    loadInvitations();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Current user:', user);

      if (!user) {
        console.error('No user found');
        return;
      }

      // First get the manager's team
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

      // Then get all members of that team with their profile information
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

      // Transform the data to match our interface
      const membersWithProfiles = (membersData || []).map(member => ({
        ...member,
        profile: member.profiles || {
          first_name: null,
          last_name: null,
          email: null
        }
      }));

      // Fetch metrics for each team member
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

      // Get the team ID first
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

      // Get the current user and their team
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

      // Check if user exists (but don't require it)
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', email)
        .single();

      console.log('User data for invitation:', userData);

      // Create the invitation
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <DashboardHeader onInviteMember={handleInviteMember} />

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
          </TabsTrigger>
          <TabsTrigger value="invitations" className="flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Pending Invitations
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Performance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <TeamMembersList 
            members={teamMembers}
            isLoading={isLoading}
            onRemoveMember={handleRemoveMember}
          />
        </TabsContent>

        <TabsContent value="invitations">
          <InvitationsList 
            invitations={invitations}
            onCancelInvitation={handleCancelInvitation}
          />
        </TabsContent>

        <TabsContent value="performance">
          <Card className="p-6">
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Coming Soon</AlertTitle>
              <AlertDescription>
                Team performance analytics and reporting features are coming soon.
              </AlertDescription>
            </Alert>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManagerDashboard;