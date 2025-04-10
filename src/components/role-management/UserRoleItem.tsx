import { UserWithRoles } from "@/hooks/useRoleManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import { formatRoleName, getBadgeVariant } from "@/components/role-management/roleUtils";
import { useToast } from "@/hooks/use-toast";
import { ManagerSelect } from "./ManagerSelect";
import { format } from "date-fns";

interface UserRoleItemProps {
  user: UserWithRoles;
  allUsers: UserWithRoles[];
  selectedRole: string | undefined;
  isAssigningRole: boolean;
  onAssignRole: (userId: string, email: string | null) => void;
  onRemoveRole: (data: { userId: string; role: string }) => void;
  onAssignManager: (userId: string, managerId: string | null) => void;
}

export function UserRoleItem({ 
  user, 
  allUsers,
  selectedRole, 
  isAssigningRole,
  onAssignRole, 
  onRemoveRole,
  onAssignManager
}: UserRoleItemProps) {
  const { toast } = useToast();
  
  const handleAssignRole = () => {
    if (!selectedRole) {
      toast({
        title: "Error",
        description: "Please select a role first",
        variant: "destructive",
      });
      return;
    }
    onAssignRole(user.id, user.email);
  };

  const handleRemoveRole = (role: string) => {
    onRemoveRole({ userId: user.id, role });
  };

  const formatCreatedAt = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown';
    try {
      // Try parsing the date
      const date = new Date(dateStr);
      // Check if the date is valid
      if (isNaN(date.getTime())) {
        console.warn('Invalid date:', dateStr);
        return 'Unknown';
      }
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      console.warn('Error formatting date:', error);
      return 'Unknown';
    }
  };

  const formattedDate = formatCreatedAt(user.created_at);

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div className="space-y-2">
          <div>
            <h3 className="font-medium">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground">Member since {formattedDate}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Manager</p>
            <ManagerSelect 
              user={user}
              allUsers={allUsers}
              onAssignManager={onAssignManager}
            />
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
            <PlusCircle className="h-4 w-4 mr-1" />
            Assign Role
          </Button>
        </div>
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2">
        {user.roles.length > 0 ? (
          user.roles.map((role, index) => (
            <Badge 
              key={index} 
              variant={getBadgeVariant(role)} 
              className="flex items-center gap-1 group"
            >
              {formatRoleName(role)}
              <button 
                onClick={() => handleRemoveRole(role)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${role} role`}
              >
                <MinusCircle className="h-3 w-3" />
              </button>
            </Badge>
          ))
        ) : (
          <span className="text-sm text-muted-foreground">No roles assigned</span>
        )}
      </div>
    </div>
  );
}
