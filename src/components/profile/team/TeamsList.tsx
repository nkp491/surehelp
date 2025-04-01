
import React from "react";
import { Team } from "@/types/team";
import { Users } from "lucide-react";

interface TeamsListProps {
  teams: Team[];
  isLoading: boolean;
  isFixing: boolean;
}

const TeamsList = ({ teams, isLoading, isFixing }: TeamsListProps) => {
  if (isLoading || isFixing) {
    return (
      <div className="text-sm text-gray-500">
        {isFixing ? "Updating team associations..." : "Loading teams..."}
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-sm text-gray-500">
        You don't have any teams yet. Create a team to get started or have your manager add you to their team.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {teams.map((team: Team) => (
        <div key={team.id} className="flex items-center p-2 border rounded-md">
          <Users className="h-4 w-4 mr-2 text-gray-500" />
          <span>{team.name}</span>
        </div>
      ))}
    </div>
  );
};

export default TeamsList;
