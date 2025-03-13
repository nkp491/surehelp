
import { UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getBadgeVariant, formatRoleName } from "./SingleUserRoleManager";

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
    <div className="mt-4 bg-muted/50 p-4 rounded-md">
      <div className="flex items-center mb-2">
        <UserCheck className="h-5 w-5 mr-2 text-primary" />
        <h3 className="font-medium">
          {userInfo.firstName || ''} {userInfo.lastName || ''}
          {!userInfo.firstName && !userInfo.lastName && 'User'}
        </h3>
      </div>
      {userInfo.email && (
        <p className="text-sm text-muted-foreground mb-3">{userInfo.email}</p>
      )}
      
      <div className="mt-2">
        <h4 className="text-sm font-medium mb-2">Current Roles:</h4>
        {userRoles.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {userRoles.map((userRole, index) => (
              <Badge 
                key={index}
                variant={getBadgeVariant(userRole)} 
                className={`text-sm ${
                  userRole === "manager_pro_gold" 
                    ? "border-yellow-500 text-yellow-700 bg-yellow-50" 
                    : userRole === "manager_pro_platinum" 
                      ? "border-purple-500 text-purple-700 bg-purple-50" 
                      : userRole === "agent_pro"
                        ? "border-blue-500 text-blue-700 bg-blue-50"
                        : userRole === "system_admin"
                          ? "border-red-500 text-red-700 bg-red-50"
                          : ""
                }`}
              >
                {formatRoleName(userRole)}
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
