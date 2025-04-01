
import React from "react";
import { Team } from "@/types/team";
import { Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface TeamsListProps {
  teams: Team[];
  isLoading: boolean;
  isFixing: boolean;
}

const TeamsList = ({ teams, isLoading, isFixing }: TeamsListProps) => {
  if (isLoading || isFixing) {
    return (
      <div className="text-sm text-gray-500 py-2 animate-pulse">
        {isFixing ? "Updating team associations..." : "Loading teams..."}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <Alert variant="default" className="bg-muted/30 border-muted">
        <AlertDescription>
          <div className="text-sm text-gray-500">
            You don't have any teams yet. 
            {!isFixing && (
              <span>
                {" "}Create a team to get started or use the refresh button to check if your manager has added you to their team.
              </span>
            )}
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-2">
      {teams.map((team: Team) => (
        <div key={team.id} className="flex items-center p-2 border rounded-md hover:bg-muted/10 transition-colors">
          <Users className="h-4 w-4 mr-2 text-gray-500" />
          <span>{team.name}</span>
        </div>
      ))}
    </div>
  );
};

export default TeamsList;
