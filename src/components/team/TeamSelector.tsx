
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
    refreshTeams();
  }, [refreshTeams]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshTeams();
      toast({
        title: "Teams refreshed",
        description: "Your team list has been updated.",
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
