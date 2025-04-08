
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import { formatRoleName, getBadgeVariant } from "@/components/role-management/roleUtils";
import { useToast } from "@/hooks/use-toast";

interface UserRoleItemProps {
  user: UserWithRoles;
  selectedRole: string | undefined;
  isAssigningRole: boolean;
  onAssignRole: (userId: string, email: string | null) => void;
  onRemoveRole: (data: { userId: string; role: string }) => void;
}

export function UserRoleItem({ 
  user, 
  selectedRole, 
  isAssigningRole,
  onAssignRole, 
  onRemoveRole 
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

  return (
    <div className="border rounded-lg p-4">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="font-medium">
            {user.first_name} {user.last_name}
          </h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
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
