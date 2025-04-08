
import React from "react";
import { Team } from "@/types/team";
import TeamRefreshButton from "./TeamRefreshButton";
import TeamsList from "./TeamsList";
import TeamAlert from "./TeamAlert";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface TeamsSectionProps {
  teams: Team[];
  isLoadingTeams: boolean;
  isFixing: boolean;
  showAlert: boolean;
  alertMessage: string;
  onRefresh: () => Promise<void>;
  onForceTeamAssociation: () => Promise<void>;
  managerId?: string | null;
}

const TeamsSection = ({ 
  teams, 
  isLoadingTeams, 
  isFixing, 
  showAlert,
  alertMessage,
  onRefresh,
  onForceTeamAssociation,
  managerId
}: TeamsSectionProps) => {
  const { userRoles } = useRoleCheck();
  const isAgent = userRoles.some(role => role === 'agent' || role === 'agent_pro');

  return (
    <div className="space-y-2.5 mt-6 pt-6 border-t">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Your Teams</label>
        <TeamRefreshButton 
          onClick={onRefresh} 
          loading={isFixing} 
        />
      </div>
      
      {showAlert && (
        <TeamAlert 
          message={alertMessage}
          showForceButton={isAgent && !!managerId}
          onForceClick={onForceTeamAssociation}
          isLoading={isFixing}
        />
      )}
      
      <TeamsList 
        teams={teams} 
        isLoading={isLoadingTeams}
        isFixing={isFixing}
      />
    </div>
  );
};

export default TeamsSection;
