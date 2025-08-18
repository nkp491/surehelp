import { useState, useMemo, useCallback } from "react";
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
  onAssignRole: (data: {
    userId: string;
    email: string | null;
    role: string;
  }) => void;
  onRemoveRole: (data: { userId: string; role: string }) => void;
  onAssignManager: (data: { userId: string; managerId: string | null }) => void;
}

export function RolesList({
  users,
  availableRoles,
  isAssigningRole,
  onAssignRole,
  onRemoveRole,
  onAssignManager,
}: Readonly<RolesListProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | undefined>(
    undefined
  );
  const { toast } = useToast();

  // Memoize filtered users to prevent recalculation on every render
  const filteredUsers = useMemo(() => {
    return filterUsers(users, searchQuery);
  }, [users, searchQuery]);

  // Limit the number of users rendered to prevent performance issues with large lists
  const displayedUsers = useMemo(() => {
    // If no search query, limit to first 50 users for performance
    // If searching, show all results since they're likely filtered down
    return searchQuery.trim() ? filteredUsers : filteredUsers.slice(0, 50);
  }, [filteredUsers, searchQuery]);

  // Memoize role assignment handler
  const handleAssignRole = useCallback(
    (userId: string, email: string | null) => {
      if (!selectedRole) {
        toast({
          title: "Select a role",
          description: "Please select a role to assign",
          variant: "default",
        });
        return;
      }

      onAssignRole({ userId, email, role: selectedRole });
    },
    [selectedRole, onAssignRole, toast]
  );

  // Memoize manager assignment handler
  const handleAssignManager = useCallback(
    (userId: string, managerId: string | null) => {
      onAssignManager({ userId, managerId });
    },
    [onAssignManager]
  );

  // Memoize search change handler
  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // Memoize role change handler
  const handleRoleChange = useCallback((role: string | undefined) => {
    setSelectedRole(role);
  }, []);

  return (
    <div className="space-y-6">
      <RolesListFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        selectedRole={selectedRole}
        onRoleChange={handleRoleChange}
        availableRoles={availableRoles}
      />

      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
          {!searchQuery.trim() && filteredUsers.length > 50 && (
            <p className="text-sm text-muted-foreground">
              Showing first 50 users. Use search to find specific users.
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {displayedUsers.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                {searchQuery.trim()
                  ? "No users found matching your search"
                  : "No users found"}
              </p>
            ) : (
              displayedUsers.map((user) => (
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
