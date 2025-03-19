
import { useState, useEffect } from "react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle, RefreshCw } from "lucide-react";
import { TeamCreationDialog } from "./TeamCreationDialog";
import { useToast } from "@/hooks/use-toast";

interface TeamSelectorProps {
  selectedTeamId: string | undefined;
  onTeamSelect: (teamId: string) => void;
}

export function TeamSelector({ selectedTeamId, onTeamSelect }: TeamSelectorProps) {
  const { teams, isLoadingTeams, refreshTeams } = useTeamManagement();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();

  // Refresh teams when the component mounts
  useEffect(() => {
    console.log("TeamSelector mounted, refreshing teams");
    refreshTeams().catch(err => {
      console.error("Failed to refresh teams on mount:", err);
    });
  }, [refreshTeams]);

  const handleRefresh = async () => {
    try {
      console.log("Manual refresh triggered");
      setIsRefreshing(true);
      const result = await refreshTeams();
      console.log("Refresh result:", result);
      
      toast({
        title: teams && teams.length > 0 ? "Teams refreshed" : "No teams found",
        description: teams && teams.length > 0 
          ? "Your team list has been updated." 
          : "You don't have any teams yet. Try creating one!",
      });
    } catch (error) {
      console.error("Failed to refresh teams:", error);
      toast({
        title: "Refresh failed",
        description: "Could not refresh teams. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  console.log("TeamSelector rendering with:", { 
    teamsCount: teams?.length, 
    isLoadingTeams, 
    selectedTeamId 
  });

  return (
    <div className="flex items-center gap-2">
      <div className="flex-1">
        <Select
          value={selectedTeamId}
          onValueChange={onTeamSelect}
          disabled={isLoadingTeams || !teams?.length}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={isLoadingTeams ? "Loading teams..." : "Select a team"} />
          </SelectTrigger>
          <SelectContent>
            {teams?.length ? (
              teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))
            ) : (
              <SelectItem value="no-teams" disabled>
                No teams available
              </SelectItem>
            )}
          </SelectContent>
        </Select>
      </div>
      
      <Button
        variant="outline"
        size="icon"
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="h-10 w-10"
        title="Refresh teams"
      >
        <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowCreateDialog(true)}
        className="flex items-center gap-1"
      >
        <PlusCircle className="h-4 w-4" />
        <span className="hidden sm:inline">New Team</span>
      </Button>
      
      <TeamCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
