
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamSummaryTab } from "./team-details/TeamSummaryTab";
import { TeamMembersTab } from "./team-details/TeamMembersTab";
import { TeamRelationsTab } from "./team-details/TeamRelationsTab";
import { DeleteTeamDialog } from "./team-details/DeleteTeamDialog";
import { Loader2 } from "lucide-react";
import { useTeamDetailsData } from "./team-details/useTeamDetailsData";

interface Team {
  id: string;
  name: string;
  created_at: string;
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
  const [activeTab, setActiveTab] = useState("summary");
  
  const {
    isLoading,
    teamMembers,
    relatedTeams,
    teamCreator,
    showDeleteConfirm,
    setShowDeleteConfirm,
    isDeleting,
    formatDate,
    handleDeleteTeam
  } = useTeamDetailsData(team, onTeamDeleted);

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Team Details: {team.name}</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="summary" value={activeTab} onValueChange={setActiveTab} className="mt-2">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="members">Members</TabsTrigger>
                {relatedTeams.length > 0 && (
                  <TabsTrigger value="relations">Related Teams</TabsTrigger>
                )}
              </TabsList>
              
              <TabsContent value="summary">
                <TeamSummaryTab 
                  teamName={team.name}
                  createdAt={team.created_at}
                  teamMembers={teamMembers}
                  relatedTeams={relatedTeams}
                  formatDate={formatDate}
                  teamCreator={teamCreator}
                />
              </TabsContent>
              
              <TabsContent value="members">
                <TeamMembersTab 
                  teamMembers={teamMembers}
                  formatDate={formatDate}
                  onDeleteTeam={() => setShowDeleteConfirm(true)} 
                />
              </TabsContent>
              
              {relatedTeams.length > 0 && (
                <TabsContent value="relations">
                  <TeamRelationsTab 
                    relatedTeams={relatedTeams}
                  />
                </TabsContent>
              )}
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
      
      <DeleteTeamDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        teamName={team.name}
        isDeleting={isDeleting}
        onConfirm={handleDeleteTeam}
      />
    </>
  );
}
