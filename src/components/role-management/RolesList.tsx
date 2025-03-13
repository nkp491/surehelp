
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PlusCircle, MinusCircle } from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";

interface RolesListProps {
  users: UserWithRoles[];
  availableRoles: string[];
  isAssigningRole: boolean;
  onAssignRole: (data: { userId: string; email: string | null; role: string }) => void;
  onRemoveRole: (data: { userId: string; role: string }) => void;
}

export function RolesList({ 
  users, 
  availableRoles, 
  isAssigningRole,
  onAssignRole, 
  onRemoveRole 
}: RolesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);

  // Format role display text
  const formatRoleName = (role: string) => {
    if (role === "beta_user") return "Beta User";
    if (role === "manager_pro_gold") return "Manager Pro Gold";
    if (role === "manager_pro_platinum") return "Manager Pro Platinum";
    if (role === "agent_pro") return "Agent Pro";
    if (role === "manager_pro") return "Manager Pro";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get badge variant based on role
  const getBadgeVariant = (role: string) => {
    switch (role) {
      case "manager_pro_platinum": return "outline";
      case "manager_pro_gold": return "outline"; 
      case "agent_pro": return "outline";
      case "manager_pro": return "default";
      case "beta_user": return "destructive";
      default: return "secondary";
    }
  };

  // Filter users based on search query
  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  // Handle role assignment
  const handleAssignRole = (userId: string, email: string | null) => {
    if (!selectedRole) {
      toast({
        title: "Select a role",
        description: "Please select a role to assign",
        variant: "default",
      });
      return;
    }
    
    onAssignRole({ userId, email, role: selectedRole });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
        <Input
          placeholder="Search by name or email"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="md:w-1/3"
        />
        
        <div className="flex flex-1 items-end space-x-2">
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select role to assign" />
            </SelectTrigger>
            <SelectContent>
              {availableRoles.map(role => (
                <SelectItem key={role} value={role}>
                  {formatRoleName(role)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">No users found</p>
            ) : (
              filteredUsers.map(user => (
                <div key={user.id} className="border rounded-lg p-4">
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
                        onClick={() => handleAssignRole(user.id, user.email)}
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
                            onClick={() => onRemoveRole({ userId: user.id, role })}
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
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
