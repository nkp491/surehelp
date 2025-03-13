
import { Badge } from "@/components/ui/badge";
import { formatRoleName, getBadgeVariant } from "./SingleUserRoleManager";
import { PasswordResetButton } from "./PasswordResetButton";

interface UserRolesDisplayProps {
  userInfo: {
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  };
  userRoles: string[];
}

export function UserRolesDisplay({ userInfo, userRoles }: UserRolesDisplayProps) {
  return (
    <div className="bg-muted/50 p-4 rounded-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
        <div>
          <h3 className="font-semibold text-lg">
            {userInfo.firstName || userInfo.lastName 
              ? `${userInfo.firstName || ''} ${userInfo.lastName || ''}` 
              : 'Unknown User'}
          </h3>
          <p className="text-sm text-muted-foreground">{userInfo.email}</p>
        </div>
        <PasswordResetButton email={userInfo.email} />
      </div>
      
      <div className="mt-3">
        <h4 className="font-medium text-sm mb-1">Current Roles:</h4>
        {userRoles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userRoles.map((role) => (
              <Badge 
                key={role} 
                variant={getBadgeVariant(role)}
              >
                {formatRoleName(role)}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No roles assigned</p>
        )}
      </div>
    </div>
  );
}
