
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
import { PlusCircle, RefreshCw, AlertCircle, Loader2 } from "lucide-react";
import { TeamCreationDialog } from "./TeamCreationDialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamSelectorProps {
  selectedTeamId: string | undefined;
  onTeamSelect: (teamId: string) => void;
}

export function TeamSelector({ selectedTeamId, onTeamSelect }: TeamSelectorProps) {
  const { teams, isLoadingTeams, refreshTeams, lastRefreshError, isTeamMembersFetching } = useTeamManagement();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const { toast } = useToast();

  // Refresh teams when the component mounts
  useEffect(() => {
    console.log("TeamSelector mounted, refreshing teams");
    refreshTeams().catch(err => {
      console.error("Failed to refresh teams on mount:", err);
      setRefreshError("Failed to load teams. Please try refreshing.");
    });
  }, [refreshTeams]);

  const handleRefresh = async () => {
    try {
      console.log("Manual refresh triggered");
      setIsRefreshing(true);
      setRefreshError(null);
      
      const result = await refreshTeams();
      console.log("Refresh result:", result);
      
      if (teams && teams.length > 0) {
        toast({
          title: "Teams refreshed",
          description: "Your team list has been updated.",
        });
      } else {
        toast({
          title: "No teams found",
          description: "You don't have any teams yet. Try creating one!",
        });
      }
    } catch (error: any) {
      console.error("Failed to refresh teams:", error);
      setRefreshError(`Failed to load teams: ${error.message}`);
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
    selectedTeamId,
    teamsData: teams
  });

  return (
    <div className="flex flex-col gap-2">
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
          disabled={isRefreshing || isTeamMembersFetching}
          className="h-10 w-10"
          title="Refresh teams"
        >
          {isRefreshing || isTeamMembersFetching ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
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
      </div>
      
      {(refreshError || lastRefreshError) && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{refreshError || lastRefreshError}</AlertDescription>
        </Alert>
      )}
      
      <TeamCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
