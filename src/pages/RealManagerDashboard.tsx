
import { useState, useEffect } from "react";
import { useProfileManagement } from "@/hooks/useProfileManagement";
import { useManagerTeam } from "@/hooks/useManagerTeam";
import { useTeams } from "@/hooks/team/useTeams";
import { TeamsPanel } from "@/components/team/dashboard/TeamsPanel";
import { TeamDashboardTabs } from "@/components/team/dashboard/TeamDashboardTabs";
import { useToast } from "@/hooks/use-toast";

export default function RealManagerDashboard() {
  const { profile } = useProfileManagement();
  const { teams, isLoadingTeams, refetchTeams } = useTeams();
  const [selectedTeamId, setSelectedTeamId] = useState<string | undefined>();
  const { teamMembers, isLoading: isLoadingTeam } = useManagerTeam(profile?.id);
  const { toast } = useToast();

  // Fetch teams when dashboard loads
  useEffect(() => {
    console.log("Dashboard mounted, fetching teams...");
    refetchTeams();
  }, [refetchTeams]);

  // Initialize with the first team when teams are loaded
  useEffect(() => {
    if (teams && teams.length > 0 && !selectedTeamId) {
      setSelectedTeamId(teams[0].id);
      console.log("Selected first team:", teams[0].id, teams[0].name);
    } else if (teams) {
      console.log("Teams loaded:", teams.length, "Current selected team:", selectedTeamId);
    }
  }, [teams, selectedTeamId]);

  // Handle team selection
  const handleTeamChange = (teamId: string) => {
    console.log("Team selected:", teamId);
    setSelectedTeamId(teamId);
  };

  // Handle refresh
  const handleRefresh = async () => {
    console.log("Refreshing teams...");
    const result = await refetchTeams();
    console.log("Teams refresh result:", result.data);
    
    toast({
      title: "Teams Refreshed",
      description: "Your teams list has been refreshed.",
    });
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
            onRefresh={handleRefresh}
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
