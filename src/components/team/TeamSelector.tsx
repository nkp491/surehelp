
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
import { PlusCircle, RefreshCw, AlertCircle } from "lucide-react";
import { TeamCreationDialog } from "./TeamCreationDialog";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface TeamSelectorProps {
  selectedTeamId: string | undefined;
  onTeamSelect: (teamId: string) => void;
}

export function TeamSelector({ selectedTeamId, onTeamSelect }: TeamSelectorProps) {
  const { teams, isLoadingTeams, refreshTeams } = useTeamManagement();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
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
      setDebugInfo(null);
      
      // First, check if the user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error("Authentication error when refreshing teams:", authError || "No user found");
        setRefreshError("Authentication error. Please sign in again.");
        toast({
          title: "Authentication error",
          description: "Please sign out and sign in again to refresh your teams.",
          variant: "destructive",
        });
        return;
      }
      
      console.log("Authenticated user:", user.id);
      
      // Show the user's team memberships for debugging
      const { data: teamMemberships, error: membershipError } = await supabase
        .from('team_members')
        .select('team_id, role')
        .eq('user_id', user.id);
        
      if (membershipError) {
        console.error("Error fetching team memberships:", membershipError);
        setDebugInfo(`Error fetching team memberships: ${membershipError.message}`);
      } else {
        console.log("User's team memberships:", teamMemberships);
        setDebugInfo(`User has ${teamMemberships?.length || 0} team memberships`);
      }
      
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
      </div>
      
      {refreshError && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4 mr-2" />
          <AlertDescription>{refreshError}</AlertDescription>
        </Alert>
      )}
      
      {debugInfo && (
        <Alert variant="default" className="mt-2 bg-blue-50">
          <AlertDescription className="text-xs">
            Debug info: {debugInfo}
          </AlertDescription>
        </Alert>
      )}
      
      <TeamCreationDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
}
