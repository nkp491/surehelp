
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from "@/components/ui/tabs";

// Import our extracted components
import { TeamMembersTab } from "./team-details/TeamMembersTab";
import { TeamRelationsTab } from "./team-details/TeamRelationsTab";
import { TeamSummaryTab } from "./team-details/TeamSummaryTab";
import { DeleteTeamDialog } from "./team-details/DeleteTeamDialog";
import { useTeamDetailsData } from "./team-details/useTeamDetailsData";

interface TeamManager {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
}

interface Team {
  id: string;
  name: string;
  created_at: string;
  memberCount?: number;
  managers?: TeamManager[];
}

interface TeamDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  team: Team;
  onTeamDeleted: () => void;
}

export function TeamDetailsDialog({ 
  open, 
  onOpenChange, 
  team,
  onTeamDeleted
}: TeamDetailsDialogProps) {
  const {
    isLoading,
    teamMembers,
    relatedTeams,
    showDeleteConfirm,
    setShowDeleteConfirm,
    formatDate,
    handleDeleteTeam
  } = useTeamDetailsData(team, onTeamDeleted);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle className="text-xl flex items-center justify-between">
              <span>Team Details: {team.name}</span>
              <Badge variant="outline">
                Created {formatDate(team.created_at)}
              </Badge>
            </DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="members">
              <TabsList className="mb-4">
                <TabsTrigger value="members">Members ({teamMembers.length})</TabsTrigger>
                <TabsTrigger value="relations">Related Teams ({relatedTeams.length})</TabsTrigger>
                <TabsTrigger value="summary">Summary</TabsTrigger>
              </TabsList>
              
              <TabsContent value="members">
                <TeamMembersTab 
                  teamMembers={teamMembers} 
                  formatDate={formatDate} 
                />
              </TabsContent>
              
              <TabsContent value="relations">
                <TeamRelationsTab relatedTeams={relatedTeams} />
              </TabsContent>
              
              <TabsContent value="summary">
                <TeamSummaryTab 
                  teamName={team.name}
                  createdAt={team.created_at}
                  teamMembers={teamMembers}
                  relatedTeams={relatedTeams}
                  formatDate={formatDate}
                />
              </TabsContent>
            </Tabs>
          )}
          
          <DialogFooter className="gap-2">
            <div className="flex-1 text-left">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isLoading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Team
              </Button>
            </div>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <DeleteTeamDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        team={team}
        onDelete={handleDeleteTeam}
      />
    </>
  );
}
