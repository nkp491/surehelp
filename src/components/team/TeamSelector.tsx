
import { useState } from "react";
import { useTeamManagement } from "@/hooks/useTeamManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { TeamCreationDialog } from "./TeamCreationDialog";

interface TeamSelectorProps {
  selectedTeamId: string | undefined;
  onTeamSelect: (teamId: string) => void;
}

export function TeamSelector({ selectedTeamId, onTeamSelect }: TeamSelectorProps) {
  const { teams, isLoadingTeams } = useTeamManagement();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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
            {teams?.map((team) => (
              <SelectItem key={team.id} value={team.id}>
                {team.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
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
