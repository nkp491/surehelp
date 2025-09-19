import { useMemo, useCallback } from "react";
import { UserWithRoles } from "@/hooks/useRoleAssignmentOnly";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import {
  formatRoleName,
  getBadgeVariant,
} from "@/components/role-management/roleUtils";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface UserRoleItemProps {
  user: UserWithRoles;
  allUsers: UserWithRoles[];
  selectedRole: string | undefined;
  isAssigningRole: boolean;
  onAssignRole: (userId: string) => void;
}

export function UserRoleItem({
  user,
  allUsers,
  selectedRole,
  isAssigningRole,
  onAssignRole,
}: Readonly<UserRoleItemProps>) {
  const { toast } = useToast();

  // Memoize the formatted date to prevent recalculation
  const formattedDate = useMemo(() => {
    if (!user.created_at) return "Unknown";
    try {
      const date = new Date(user.created_at);
      if (isNaN(date.getTime())) {
        console.warn("Invalid date:", user.created_at);
        return "Unknown";
      }
      return format(date, "MMM d, yyyy");
    } catch (error) {
      console.warn("Error formatting date:", error);
      return "Unknown";
    }
  }, [user.created_at]);

  const handleAssignRole = useCallback(() => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role first",
        variant: "destructive",
      });
      return;
    }
    onAssignRole(user.id);
  }, [selectedRole, onAssignRole, user.id, toast]);


  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-medium">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">
              Member since {formattedDate}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium mb-1">Manager</p>
            <div className="text-sm text-muted-foreground">
              Manager assignment disabled
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAssignRole}
            disabled={isAssigningRole || !selectedRole}
            className="mr-2"
          >
            {isAssigningRole ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-1" />
                Assigning...
              </>
            ) : (
              <>
                <PlusCircle className="h-4 w-4 mr-1" />
                Assign Role
              </>
            )}
          </Button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {user.roles.length > 0 ? (
          user.roles.map((role, index) => (
            <Badge
              key={`${user.id}-${role}-${index}`}
              variant={getBadgeVariant(role)}
              className="flex items-center gap-1"
            >
              {formatRoleName(role)}
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">
            No roles assigned
          </span>
        )}
      </div>
    </div>
  );
}
