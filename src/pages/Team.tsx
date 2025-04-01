
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ManagerTeamList } from "@/components/team/ManagerTeamList";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import ProfileLoading from "@/components/profile/ProfileLoading";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamsPanel } from "@/components/team/dashboard/TeamsPanel";
import { useTeams } from "@/hooks/team/useTeams";
import { useToast } from "@/hooks/use-toast";

export default function TeamPage() {
  const { profile, loading } = useProfileManagement();
  const { teams, isLoadingTeams, refetchTeams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const { toast } = useToast();

  // Fetch teams when page loads
  useEffect(() => {
    console.log("Team page mounted, fetching teams...");
    refetchTeams();
  }, [refetchTeams]);

  // Initialize with the first team when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
      console.log("Selected first team:", teams[0].id, teams[0].name);
    } else if (teams) {
      console.log("Teams loaded:", teams.length, "Current selected team:", selectedTeamId);
    }
  }, [teams, selectedTeamId]);

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    console.log("Team selected:", teamId);
    setSelectedTeamId(teamId);
  };

  // Handle refresh
  const handleRefresh = async () => {
    console.log("Refreshing teams...");
    const result = await refetchTeams();
    console.log("Teams refresh result:", result.data);
    
    toast({
      title: "Teams Refreshed",
      description: "Your teams list has been refreshed.",
    });
  };

  if (loading) {
    return <ProfileLoading />;
  }

  const isManager = profile?.role?.includes('manager_pro') || 
                    profile?.roles?.some(r => r.includes('manager_pro'));
                    
  const isHigherTierManager = 
    profile?.role?.includes('manager_pro_gold') || 
    profile?.role?.includes('manager_pro_platinum') ||
    profile?.roles?.some(r => r.includes('manager_pro_gold')) ||
    profile?.roles?.some(r => r.includes('manager_pro_platinum'));

  return (
    <RoleBasedRoute requiredRoles={['manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']}>
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            {isManager 
              ? "Manage your team members and their organization." 
              : "View your team information."}
          </p>
        </div>

        {isManager && (
          <div className="grid grid-cols-12 gap-6">
            {/* Teams Panel */}
            <div className="col-span-12 md:col-span-3">
              <TeamsPanel
                teams={teams}
                isLoadingTeams={isLoadingTeams}
                selectedTeamId={selectedTeamId}
                onTeamSelect={handleTeamChange}
                onRefresh={handleRefresh}
              />
            </div>
            
            {/* Team Content */}
            <div className="col-span-12 md:col-span-9">
              <ManagerTeamList managerId={profile?.id} selectedTeamId={selectedTeamId} />
            </div>
          </div>
        )}

        {!isManager && (
          <Card>
            <CardHeader>
              <CardTitle>Your Manager</CardTitle>
              <CardDescription>View information about your assigned manager</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-muted rounded-lg p-6 text-center">
                <h3 className="text-lg font-medium mb-2">Your Manager</h3>
                <p className="text-muted-foreground">
                  {profile?.manager_id 
                    ? "Your manager information will be displayed here" 
                    : "You don't have a manager assigned yet. Please update your profile to select a manager."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleBasedRoute>
  );
}
