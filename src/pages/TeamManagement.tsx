
import { useState, useEffect } from 'react';
import { TeamSelector } from "@/components/team/TeamSelector";
import { TeamMembersList } from "@/components/team/TeamMembersList";
import { TeamInvitationsList } from "@/components/team/TeamInvitationsList";
import { TeamHierarchyView } from "@/components/team/TeamHierarchyView";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function TeamManagement() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("members");
  const { teams, isLoadingTeams, refreshTeams, canViewHierarchy } = useTeamManagement();
  const { hasRequiredRole } = useRoleCheck();
  
  // Check if user has the required roles to view hierarchy
  const hasHierarchyAccess = hasRequiredRole(['manager_pro_gold', 'manager_pro_platinum', 'system_admin']);

  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  useEffect(() => {
    refreshTeams();
  }, [refreshTeams]);
  
  // Show the hierarchy tab only if user has access to it and a team is selected
  const showHierarchyTab = hasHierarchyAccess && selectedTeamId && canViewHierarchy(selectedTeamId);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Team Management</h1>
        <p className="text-muted-foreground">
          Manage your team members, invitations, and view team hierarchy.
        </p>
      </div>

      <div className="mb-6">
        <TeamSelector 
          selectedTeamId={selectedTeamId}
          onTeamSelect={setSelectedTeamId}
        />
      </div>

      {!selectedTeamId ? (
        teams && teams.length > 0 ? (
          <Card className="p-6 text-center">
            <p>Please select a team to manage.</p>
          </Card>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No teams found</AlertTitle>
            <AlertDescription>
              You don't have any teams yet. Create a team to get started.
            </AlertDescription>
          </Alert>
        )
      ) : (
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="members">Team Members</TabsTrigger>
            <TabsTrigger value="invitations">Invitations</TabsTrigger>
            {showHierarchyTab && (
              <TabsTrigger value="hierarchy">Team Hierarchy</TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="members" className="space-y-6">
            <TeamMembersList teamId={selectedTeamId} />
          </TabsContent>
          
          <TabsContent value="invitations" className="space-y-6">
            <TeamInvitationsList teamId={selectedTeamId} />
          </TabsContent>
          
          {showHierarchyTab && (
            <TabsContent value="hierarchy" className="space-y-6">
              <TeamHierarchyView 
                rootTeamId={selectedTeamId} 
                timePeriod="30d" 
              />
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  );
}
