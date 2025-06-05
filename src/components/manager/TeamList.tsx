import type { TeamListProps } from "@/types/team";
import { Users, ChevronDown, ChevronUp, Loader } from "lucide-react";
import { memo, useState } from "react";

const EmptyState = () => (
  <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-bold">TEAMS</h2>
    </div>
    <div className="text-center py-8 text-gray-500">No teams available at the moment.</div>
  </div>
);

const TeamList = memo(({ teams = [], setSelectedTeam, loading }: TeamListProps) => {
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const handleTeamClick = (teamId: string) => {
    setExpandedTeam((prev) => (prev === teamId ? null : teamId));
  };
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center p-6">
          <Loader className="h-6 w-6 animate-spin" />
        </div>
      );
    }
    if (!teams || teams.length === 0) {
      return <EmptyState />;
    }
    return teams.map((team) => (
      <div key={team.id} className="space-y-2">
        <div
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
          onClick={() => {
            handleTeamClick(team.id);
            setSelectedTeam(team);
          }}
        >
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium">{team.name}</h3>
              <p className="text-sm text-muted-foreground">{team.members.length} members</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <div className="font-medium text-green-600">{team.performance}%</div>
              <div className="text-sm text-muted-foreground">Performance</div>
            </div>
            {expandedTeam === team.id ? (
              <ChevronUp className="h-4 w-4 text-gray-500" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-500" />
            )}
          </div>
        </div>
        {expandedTeam === team.id && (
          <div className="pl-11 space-y-2">
            {team.members.map((member) => (
              <div
                key={member.id}
                className="p-2 bg-gray-50 rounded-md flex items-center justify-between"
              >
                <div className="flex items-center space-x-2">
                  {member.profile_image_url ? (
                    <img src={member.profile_image_url} className="size-6 rounded-full" />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium">
                      {member.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium">{member.name}</p>
                    <p className="text-xs text-muted-foreground">{member.role}</p>
                  </div>
                </div>
                {member.email && <p className="text-xs text-muted-foreground">{member.email}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    ));
  };

  return (
    <div className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">TEAMS</h2>
      </div>
      <div className="space-y-4">{renderContent()}</div>
    </div>
  );
});

export default TeamList;
