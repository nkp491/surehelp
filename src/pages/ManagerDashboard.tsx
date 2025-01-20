import { useState, useEffect } from "react";
import { AlertCircle, Users, TrendingUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  user_id: string;
  role: 'manager' | 'member';
  profile: {
    first_name: string | null;
    last_name: string | null;
    email: string | null;
  } | null;
  metrics?: {
    leads: number;
    calls: number;
    contacts: number;
    scheduled: number;
    sits: number;
    sales: number;
    ap: number;
  };
}

const ManagerDashboard = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    try {
      // First get team members with their profiles
      const { data: teamMembersData, error: teamError } = await supabase
        .from('team_members')
        .select(`
          *,
          user:user_id (
            profile:profiles (
              first_name,
              last_name,
              email
            )
          )
        `);

      if (teamError) throw teamError;

      // Transform the data to match our interface
      const membersWithProfiles = teamMembersData.map(member => ({
        ...member,
        profile: member.user?.profile || null
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
              leads: 0,
              calls: 0,
              contacts: 0,
              scheduled: 0,
              sits: 0,
              sales: 0,
              ap: 0
            }
          };
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

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm border border-[#fbfaf8]">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Team Dashboard</h2>
          <p className="text-muted-foreground mt-1">Manage your team and view performance metrics</p>
        </div>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Team Members
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
                Start building your team by adding members.
              </AlertDescription>
            </Alert>
          )}
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