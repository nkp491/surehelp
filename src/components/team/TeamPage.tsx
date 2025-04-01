
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { TeamSelector } from "./TeamSelector";
import { TeamMembersList } from "./TeamMembersList";
import { TeamCreationDialog } from "./TeamCreationDialog";
import { AddTeamMemberDialog } from "./AddTeamMemberDialog";
import { TeamMetricsOverview } from "./TeamMetricsOverview";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function TeamPage() {
  const [isCreatingTeam, setIsCreatingTeam] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const [isAddingMember, setIsAddingMember] = useState(false);
  
  const { 
    teams, 
    isLoadingTeams, 
    createTeam,
    useTeamMembers,
    addTeamMember,
    isTeamManager
  } = useTeamManagement();
  
  const { data: teamMembers, isLoading: isLoadingMembers } = useTeamMembers(selectedTeamId);
  const [canManageTeam, setCanManageTeam] = useState(false);
  
  // Check if user can manage the selected team
  const checkPermissions = async () => {
    if (selectedTeamId) {
      const hasPermission = await isTeamManager(selectedTeamId);
      setCanManageTeam(hasPermission);
    } else {
      setCanManageTeam(false);
    }
  };

  // Update permissions when team selection changes
  useEffect(() => {
    checkPermissions();
  }, [selectedTeamId]);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Team Management</h1>
        <Button
          onClick={() => setIsCreatingTeam(true)}
          className="flex items-center gap-1"
        >
          <Plus className="h-4 w-4" />
          <span>Create Team</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Select Team</CardTitle>
          </CardHeader>
          <CardContent>
            <TeamSelector
              selectedTeamId={selectedTeamId}
              onTeamSelect={(teamId) => {
                setSelectedTeamId(teamId);
                checkPermissions();
              }}
            />
          </CardContent>
        </Card>

        {selectedTeamId && (
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="members">Team Members</TabsTrigger>
              <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="members">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Team Members</CardTitle>
                  {canManageTeam && (
                    <Button
                      size="sm"
                      onClick={() => setIsAddingMember(true)}
                      className="flex items-center gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Member</span>
                    </Button>
                  )}
                </CardHeader>
                <CardContent>
                  <TeamMembersList
                    teamId={selectedTeamId}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="metrics">
              <TeamMetricsOverview teamId={selectedTeamId} />
            </TabsContent>
          </Tabs>
        )}
      </div>
      
      {/* Dialogs */}
      <TeamCreationDialog
        open={isCreatingTeam}
        onOpenChange={setIsCreatingTeam}
      />
      
      {selectedTeamId && (
        <AddTeamMemberDialog
          open={isAddingMember}
          onOpenChange={setIsAddingMember}
          teamId={selectedTeamId}
        />
      )}
    </div>
  );
}

export default TeamPage;
