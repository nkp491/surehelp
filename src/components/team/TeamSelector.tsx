
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
import { PlusCircle, RefreshCw, AlertCircle, Loader2, Filter } from "lucide-react";
import { TeamCreationDialog } from "./TeamCreationDialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { Team } from "@/types/team";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const { hasRequiredRole } = useRoleCheck();
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);
  const [showManagerTeamsOnly, setShowManagerTeamsOnly] = useState(false);
  
  // Check if user has gold/platinum access for advanced filtering
  const hasAdvancedAccess = hasRequiredRole(['manager_pro_gold', 'manager_pro_platinum', 'system_admin']);

  // Filter teams based on user preference
  useEffect(() => {
    if (!teams) {
      setFilteredTeams([]);
      return;
    }
    
    // Apply filters here
    let result = [...teams];
    
    // Filter logic will be expanded in future phases
    
    setFilteredTeams(result);
  }, [teams, showManagerTeamsOnly]);

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
    teamsData: teams,
    filteredTeamsCount: filteredTeams?.length
  });

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Select
            value={selectedTeamId}
            onValueChange={onTeamSelect}
            disabled={isLoadingTeams || !filteredTeams?.length}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={isLoadingTeams ? "Loading teams..." : "Select a team"} />
            </SelectTrigger>
            <SelectContent>
              {filteredTeams?.length ? (
                filteredTeams.map((team) => (
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
        
        {hasAdvancedAccess && (
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="outline" 
                size="icon" 
                className="h-10 w-10"
                title="Filter teams"
              >
                <Filter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="space-y-3">
                <h4 className="font-medium">Filter Teams</h4>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="manager-teams" 
                    checked={showManagerTeamsOnly}
                    onCheckedChange={(checked) => 
                      setShowManagerTeamsOnly(checked === true)
                    }
                  />
                  <Label htmlFor="manager-teams">Show only my managed teams</Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  More filters will be available in future updates.
                </p>
              </div>
            </PopoverContent>
          </Popover>
        )}
        
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
