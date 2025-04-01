
import { useState, useEffect } from "react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useManagerTeam } from "@/hooks/useManagerTeam";
import { useTeams } from "@/hooks/team/useTeams";
import { TeamsPanel } from "@/components/team/dashboard/TeamsPanel";
import { TeamDashboardTabs } from "@/components/team/dashboard/TeamDashboardTabs";

export default function RealManagerDashboard() {
  const { profile } = useProfileManagement();
  const { teams, isLoadingTeams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const { teamMembers, isLoading: isLoadingTeam } = useManagerTeam(profile?.id);

  // Initialize with the first team when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
    }
  }, [teams, selectedTeamId]);

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    setSelectedTeamId(teamId);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-12 gap-6">
        {/* Left Column */}
        <div className="col-span-12 md:col-span-3 space-y-6">
          <TeamsPanel
            teams={teams}
            isLoadingTeams={isLoadingTeams}
            selectedTeamId={selectedTeamId}
            onTeamSelect={handleTeamChange}
          />
        </div>

        {/* Middle and Right Columns Combined */}
        <div className="col-span-12 md:col-span-9">
          <TeamDashboardTabs managerId={profile?.id} />
        </div>
      </div>
    </div>
  );
}
