import { useState, useEffect } from "react";
import { AlertCircle, Users, TrendingUp, UserPlus } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeamMember, TeamInvitation, InvitationStatus } from "@/types/team";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const ManagerDashboard = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
    loadInvitations();
  }, []);

  const loadTeamMembers = async () => {
    try {
      const { data: teamMembersData, error: teamError } = await supabase
        .from('team_members')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `);

      if (teamError) throw teamError;

      // Transform the data to match our interface
      const membersWithProfiles = teamMembersData.map(member => ({
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
            id: member.id,
            team_id: member.team_id,
            user_id: member.user_id,
            role: member.role,
            joined_at: member.joined_at,
            created_at: member.created_at,
            updated_at: member.updated_at,
            profile: member.profile,
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
      const { data: invitationsData, error } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('status', 'pending' as InvitationStatus);

      if (error) throw error;
      setInvitations(invitationsData as TeamInvitation[]);
    } catch (error) {
      console.error('Error loading invitations:', error);
      toast({
        title: "Error",
        description: "Failed to load invitations",
        variant: "destructive",
      });
    }
  };

  const handleInviteMember = async () => {
    try {
      // Get the team ID for the current manager
      const { data: teamData } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .eq('role', 'manager')
        .single();

      if (!teamData?.team_id) {
        toast({
          title: "Error",
          description: "You need to be a team manager to invite members",
          variant: "destructive",
        });
        return;
      }

      // Check if user exists (but don't require it)
      const { data: userData } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', inviteEmail)
        .single();

      // Create the invitation
      const { error: inviteError } = await supabase
        .from('team_invitations')
        .insert({
          team_id: teamData.team_id,
          invitee_id: userData?.id || null,
          invitee_email: inviteEmail,
          status: 'pending'
        });

      if (inviteError) throw inviteError;

      toast({
        title: "Success",
        description: "Invitation sent successfully",
      });

      setInviteEmail("");
      loadInvitations();
    } catch (error) {
      console.error('Error inviting member:', error);
      toast({
        title: "Error",
        description: "Failed to send invitation",
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8]">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your team and view performance metrics</p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Input
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                />
              </div>
              <Button onClick={handleInviteMember} className="w-full">
                Send Invitation
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

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

        <TabsContent value="members" className="space-y-4">
          {isLoading ? (
            <Card className="p-8">
              <div className="animate-pulse space-y-4">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </Card>
          ) : teamMembers.length > 0 ? (
            <Card className="p-6">
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <h3 className="font-semibold">
                        {member.profile?.first_name} {member.profile?.last_name}
                      </h3>
                      <p className="text-sm text-gray-500">{member.profile?.email}</p>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                        {member.role}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Leads</p>
                        <p className="font-semibold">{member.metrics?.leads || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Sales</p>
                        <p className="font-semibold">{member.metrics?.sales || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">AP</p>
                        <p className="font-semibold">
                          ${member.metrics?.ap ? (member.metrics.ap / 100).toFixed(2) : '0.00'}
                        </p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No team members found</AlertTitle>
              <AlertDescription>
                Start building your team by inviting members.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card className="p-6">
            {invitations.length > 0 ? (
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm text-gray-500">Invitation sent to:</p>
                      <p className="font-semibold">{invitation.invitee_id}</p>
                      <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                        {invitation.status}
                      </span>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={async () => {
                        const { error } = await supabase
                          .from('team_invitations')
                          .update({ status: 'cancelled' })
                          .eq('id', invitation.id);
                        
                        if (!error) {
                          loadInvitations();
                          toast({
                            title: "Success",
                            description: "Invitation cancelled successfully",
                          });
                        }
                      }}
                    >
                      Cancel Invitation
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No pending invitations</AlertTitle>
                <AlertDescription>
                  You haven't sent any team invitations yet.
                </AlertDescription>
              </Alert>
            )}
          </Card>
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