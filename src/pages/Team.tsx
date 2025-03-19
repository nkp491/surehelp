
import { useState, useEffect } from "react";
import { TeamSelector } from "@/components/team/TeamSelector";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamBulletinBoard } from "@/components/team/TeamBulletinBoard";
import { TeamMetricsOverview } from "@/components/team/TeamMetricsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { RefreshCw, AlertCircle, Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function TeamPage() {
  const { teams, isLoadingTeams, refreshTeams, lastRefreshError } = useTeamManagement();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [showDebugInfo, setShowDebugInfo] = useState(false);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setAuthInfo(`Not authenticated: ${error?.message || "No user found"}`);
      } else {
        setAuthInfo(`Authenticated as ${data.user.email} (${data.user.id})`);
      }
    };

    checkAuth();
  }, []);

  // Select the first team by default when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      console.log("Auto-selecting first team:", teams[0].id);
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Force refresh teams when component mounts
  useEffect(() => {
    refreshTeams().catch(err => {
      console.error("Error refreshing teams on page load:", err);
    });
  }, [refreshTeams]);

  const handleManualRefresh = () => {
    refreshTeams().catch(err => {
      console.error("Manual refresh error:", err);
    });
  };

  console.log("Team page rendering:", { 
    teamsCount: teams?.length, 
    teamsData: teams,
    selectedTeamId,
    isLoadingTeams,
    authInfo,
    lastRefreshError
  });

  return (
    <div className="container max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
          <p className="text-muted-foreground">
            Manage your team, track performance, and communicate with your agents.
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <TeamSelector 
            selectedTeamId={selectedTeamId} 
            onTeamSelect={setSelectedTeamId}
          />
          
          <div className="text-right">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDebugInfo(!showDebugInfo)}
              className="text-xs text-muted-foreground"
            >
              <Info className="h-3 w-3 mr-1" />
              {showDebugInfo ? "Hide" : "Show"} Debug Info
            </Button>
          </div>
        </div>
      </div>

      {showDebugInfo && (
        <Alert className="bg-blue-50 mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Debug Information</AlertTitle>
          <AlertDescription>
            <div className="text-xs">
              <p>Auth: {authInfo}</p>
              {lastRefreshError && <p className="text-red-500">Last error: {lastRefreshError}</p>}
              <p>Teams loaded: {teams?.length || 0}</p>
              <p>Selected team: {selectedTeamId || "none"}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                className="mt-2"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Force Refresh
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {isLoadingTeams ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Loading teams...</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Please wait while we load your teams.
          </p>
        </div>
      ) : teams && teams.length === 0 ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">No Teams Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            You don't have any teams yet. Create a new team to get started with team management.
          </p>
          <Alert className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              If you've created teams before and can't see them, try refreshing using the refresh button 
              or signing out and back in.
            </AlertDescription>
          </Alert>
        </div>
      ) : !selectedTeamId ? (
        <div className="border rounded-md p-8 text-center bg-muted/30">
          <h2 className="text-xl font-semibold mb-2">Select or Create a Team</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-4">
            Choose a team from the dropdown above or create a new team to get started with team management.
          </p>
        </div>
      ) : (
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full justify-start mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="members">Members</TabsTrigger>
            <TabsTrigger value="bulletins">Bulletins</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <TeamMetricsOverview teamId={selectedTeamId} />
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <TeamMembersList teamId={selectedTeamId} />
              </div>
              <div className="flex-1">
                <TeamBulletinBoard teamId={selectedTeamId} />
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="members">
            <TeamMembersList teamId={selectedTeamId} />
          </TabsContent>
          
          <TabsContent value="bulletins">
            <TeamBulletinBoard teamId={selectedTeamId} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
