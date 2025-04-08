
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users } from "lucide-react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useManagerTeam } from "@/hooks/useManagerTeam";
import { useTeams } from "@/hooks/team/useTeams";
import { ManagerTeamList } from "@/components/team/ManagerTeamList";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

export default function RealManagerDashboard() {
  const { profile } = useProfileManagement();
  const { teams, isLoadingTeams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const { teamMembers, isLoading: isLoadingTeam } = useManagerTeam(profile?.id);

  // Initialize with the first team when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          {/* Teams Section */}
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">TEAMS</h2>
              <Button variant="ghost" size="icon" asChild>
                <a href="/team">
                  <Settings className="h-5 w-5" />
                </a>
              </Button>
            </div>
            <div className="space-y-2">
              {isLoadingTeams ? (
                <div className="space-y-2">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-8 w-full" />
                </div>
              ) : teams && teams.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {teams.map(team => (
                    <Button 
                      key={team.id}
                      variant={selectedTeamId === team.id ? "secondary" : "outline"}
                      onClick={() => handleTeamChange(team.id)}
                      className="justify-start"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      {team.name}
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="text-muted-foreground text-sm">
                  <p>No teams found.</p>
                  <a href="/team" className="text-primary hover:underline">
                    Create or join a team
                  </a>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Middle and Right Columns Combined */}
        <div className="col-span-12 md:col-span-9">
          <Tabs defaultValue="team" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="team">Your Team</TabsTrigger>
              <TabsTrigger value="meetings">1:1 Meetings</TabsTrigger>
              <TabsTrigger value="calculator">Success Calculator</TabsTrigger>
            </TabsList>
            
            <TabsContent value="team">
              <Card className="p-4 h-full">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Your Team Members</CardTitle>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <ManagerTeamList managerId={profile?.id} />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="meetings">
              <Card className="p-4 h-full">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>1:1 Meetings</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    1:1 Meeting management coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Schedule and manage one-on-one meetings with your team members
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="calculator">
              <Card className="p-4 h-full">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Success Calculator</CardTitle>
                </CardHeader>
                <CardContent className="p-6 text-center">
                  <p className="text-muted-foreground">
                    Success Calculator coming soon!
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Calculate and visualize success metrics for your team
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
