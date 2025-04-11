import { useState } from "react";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserRoleItem } from "@/components/role-management/UserRoleItem";
import { RolesListFilters } from "@/components/role-management/RolesListFilters";
import { filterUsers } from "@/components/role-management/roleUtils";

interface RolesListProps {
  users: UserWithRoles[];
  availableRoles: string[];
  isAssigningRole: boolean;
  onAssignRole: (data: { userId: string; email: string | null; role: string }) => void;
  onRemoveRole: (data: { userId: string; role: string }) => void;
  onAssignManager: (data: { userId: string; managerId: string | null }) => void;
}

export function RolesList({ 
  users, 
  availableRoles, 
  isAssigningRole,
  onAssignRole, 
  onRemoveRole,
  onAssignManager
}: RolesListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const { toast } = useToast();

  // Filter users based on search query
  const filteredUsers = filterUsers(users, searchQuery);

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

  // Handle manager assignment
  const handleAssignManager = (userId: string, managerId: string | null) => {
    onAssignManager({ userId, managerId });
  };

  return (
    <div className="space-y-6">
      <RolesListFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        availableRoles={availableRoles}
      />

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
                <UserRoleItem
                  key={user.id}
                  user={user}
                  allUsers={users}
                  selectedRole={selectedRole}
                  isAssigningRole={isAssigningRole}
                  onAssignRole={handleAssignRole}
                  onRemoveRole={onRemoveRole}
                  onAssignManager={handleAssignManager}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
