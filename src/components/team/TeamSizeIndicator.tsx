import React from "react";
import { Badge } from "@/components/ui/badge";
import { Users, AlertTriangle } from "lucide-react";
import { getTeamSizeInfo } from "@/utils/teamLimits";

interface TeamSizeIndicatorProps {
  managerRole: string;
  currentSize: number;
  className?: string;
}

export const TeamSizeIndicator: React.FC<TeamSizeIndicatorProps> = ({
  managerRole,
  currentSize,
  className = "",
}) => {
  const teamInfo = getTeamSizeInfo(managerRole, currentSize);

  const getStatusColor = () => {
    if (teamInfo.isUnlimited) return "bg-green-100 text-green-800";
    if (teamInfo.isAtLimit) return "bg-red-100 text-red-800";
    if (typeof teamInfo.remaining === "number" && teamInfo.remaining <= 2)
      return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  const getStatusIcon = () => {
    if (teamInfo.isAtLimit) return <AlertTriangle className="h-3 w-3" />;
    return <Users className="h-3 w-3" />;
  };

  return (
    <Badge
      variant="secondary"
      className={`${getStatusColor()} ${className} flex items-center gap-1`}
    >
      {getStatusIcon()}
      <span className="text-xs">
        {teamInfo.current}/{teamInfo.limit}
        {teamInfo.isUnlimited && " (Unlimited)"}
        {teamInfo.isAtLimit && " (Full)"}
      </span>
    </Badge>
  );
};

export default TeamSizeIndicator;
