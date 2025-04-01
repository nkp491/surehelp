
import { useState } from "react";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { UserRoleItem } from "@/components/role-management/UserRoleItem";
import { RolesListFilters } from "@/components/role-management/RolesListFilters";
import { filterUsers } from "@/components/role-management/roleUtils";
import { useRoleCheck } from "@/hooks/useRoleCheck";

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
  const [selectedRole, setSelectedRole] = useState<string | undefined>(undefined);
  const [managerFilter, setManagerFilter] = useState<string>("");
  const { toast } = useToast();
  const { hasRequiredRole } = useRoleCheck();
  const isAdmin = hasRequiredRole(['system_admin']);

  // Enhanced filter function to include manager filtering
  const getFilteredUsers = () => {
    // First filter by search query
    let filteredUsers = filterUsers(users, searchQuery);
    
    // Then filter by manager if admin and manager filter is set
    if (isAdmin && managerFilter) {
      filteredUsers = filteredUsers.filter(user => {
        // Case insensitive search on manager name and email
        const managerNameLower = (user.manager_name || '').toLowerCase();
        const managerEmailLower = (user.manager_email || '').toLowerCase();
        const filterLower = managerFilter.toLowerCase();
        
        return managerNameLower.includes(filterLower) || 
               managerEmailLower.includes(filterLower);
      });
    }
    
    return filteredUsers;
  };

  const filteredUsers = getFilteredUsers();

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
      <RolesListFilters 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        availableRoles={availableRoles}
        isAdmin={isAdmin}
        managerFilter={managerFilter}
        onManagerFilterChange={setManagerFilter}
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
                  selectedRole={selectedRole}
                  isAssigningRole={isAssigningRole}
                  onAssignRole={handleAssignRole}
                  onRemoveRole={onRemoveRole}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
