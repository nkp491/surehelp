
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Users, RefreshCw } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Team } from "@/types/team";

interface TeamsPanelProps {
  teams: Team[] | null;
  isLoadingTeams: boolean;
  selectedTeamId: string | undefined;
  onTeamSelect: (teamId: string) => void;
  onRefresh?: () => void;
}

export function TeamsPanel({ 
  teams, 
  isLoadingTeams, 
  selectedTeamId, 
  onTeamSelect,
  onRefresh
}: TeamsPanelProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">TEAMS</h2>
        <div className="flex space-x-1">
          {onRefresh && (
            <Button variant="ghost" size="icon" onClick={onRefresh}>
              <RefreshCw className="h-5 w-5" />
            </Button>
          )}
          <Button variant="ghost" size="icon" asChild>
            <a href="/team">
              <Settings className="h-5 w-5" />
            </a>
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        {isLoadingTeams ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : teams && teams.length > 0 ? (
          <div className="flex flex-col gap-2">
            {teams.map(team => (
              <Button 
                key={team.id}
                variant={selectedTeamId === team.id ? "secondary" : "outline"}
                onClick={() => onTeamSelect(team.id)}
                className="justify-start"
              >
                <Users className="h-4 w-4 mr-2" />
                {team.name}
              </Button>
            ))}
          </div>
        ) : (
          <div className="text-muted-foreground text-sm">
            <p>No teams found.</p>
            <a href="/team" className="text-primary hover:underline">
              Create or join a team
            </a>
          </div>
        )}
      </div>
    </Card>
  );
}
