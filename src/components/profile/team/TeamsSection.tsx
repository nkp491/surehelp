
import React from "react";
import { Team } from "@/types/team";
import TeamRefreshButton from "./TeamRefreshButton";
import TeamsList from "./TeamsList";
import TeamAlert from "./TeamAlert";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface TeamsSectionProps {
  teams: Team[];
  isLoadingTeams?: boolean;
  isFixing?: boolean;
  isUpdating?: boolean; 
  showAlert?: boolean;
  alertMessage?: string;
  onRefresh?: () => Promise<void>;
  refreshTeamAssociations?: () => Promise<void>;
  onForceTeamAssociation?: () => Promise<void>;
  managerId?: string | null;
}

const TeamsSection = ({ 
  teams, 
  isLoadingTeams = false, 
  isFixing = false,
  isUpdating = false,
  showAlert = false,
  alertMessage = "",
  onRefresh,
  refreshTeamAssociations,
  onForceTeamAssociation,
  managerId
}: TeamsSectionProps) => {
  const { userRoles } = useRoleCheck();
  const isAgent = userRoles.some(role => role === 'agent' || role === 'agent_pro');
  
  // Use either refreshTeamAssociations or onRefresh based on which is provided
  const handleRefresh = refreshTeamAssociations || onRefresh;

  return (
    <div className="space-y-2.5 mt-6 pt-6 border-t">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">Your Teams</label>
        <TeamRefreshButton 
          onClick={handleRefresh} 
          loading={isFixing || isUpdating} 
        />
      </div>
      
      {showAlert && (
        <TeamAlert 
          message={alertMessage}
          showForceButton={isAgent && !!managerId}
          onForceClick={onForceTeamAssociation}
          isLoading={isFixing || isUpdating}
        />
      )}
      
      <TeamsList 
        teams={teams} 
        isLoading={isLoadingTeams}
        isFixing={isFixing || isUpdating}
      />
    </div>
  );
};

export default TeamsSection;
