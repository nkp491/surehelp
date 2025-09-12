import { useTeamLimitValidation } from "@/hooks/useTeamLimitValidation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, Users, AlertCircle, CheckCircle } from "lucide-react";

interface TeamLimitIndicatorProps {
  managerId?: string;
  showDetails?: boolean;
  className?: string;
}
export function TeamLimitIndicator({
  managerId,
  showDetails = true,
  className = "",
}: Readonly<TeamLimitIndicatorProps>) {
  const {
    canAdd,
    message,
    currentCount,
    limit,
    managerRole,
    isLoading,
    error,
  } = useTeamLimitValidation({ managerId });

  if (!managerId) {
    return null;
  }

  if (isLoading) {
    return (
      <div
        className={`flex items-center gap-2 p-3 bg-muted rounded-md ${className}`}
      >
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Checking team limits...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error checking team limits: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  if (!managerRole) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Manager role not found or invalid</AlertDescription>
      </Alert>
    );
  }

  const isUnlimited = limit === -1;
  const progressPercentage = isUnlimited ? 0 : (currentCount / limit) * 100;
  const isNearLimit = !isUnlimited && currentCount >= limit * 0.8; // 80% threshold
  const isAtLimit = !isUnlimited && currentCount >= limit;

  const getAlertVariant = () => {
    if (isAtLimit) return "destructive";
    if (isNearLimit) return "default";
    return "default";
  };

  const getBadgeVariant = () => {
    if (isAtLimit) return "destructive";
    if (isNearLimit) return "secondary";
    return "default";
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Main Status */}
      <Alert variant={getAlertVariant()}>
        {canAdd ? (
          <CheckCircle className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertDescription>
          <div className="flex items-center justify-between">
            <span className="font-medium">{message}</span>
            <Badge variant={getBadgeVariant()}>
              {managerRole.replace("_", " ").toUpperCase()}
            </Badge>
          </div>
        </AlertDescription>
      </Alert>
      {showDetails && (
        <div className="space-y-2">
          {/* Team Count Display */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
            <Users className="h-4 w-4" />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Team Members</span>
                <span className="text-sm text-muted-foreground">
                  {currentCount} {isUnlimited ? "" : `of ${limit}`}
                </span>
              </div>
              {/* Progress Bar (only for limited roles) */}
              {!isUnlimited && (
                <div className="mt-2">
                  <Progress value={progressPercentage} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>0</span>
                    <span>{limit}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Additional Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div>Manager Role: {managerRole}</div>
            <div>Can Add Members: {canAdd ? "Yes" : "No"}</div>
            {!isUnlimited && (
              <div>Remaining Slots: {Math.max(0, limit - currentCount)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
