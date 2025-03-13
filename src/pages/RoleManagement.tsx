
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { AccessControl } from "@/components/role-management/AccessControl";
import { RoleManagementContent } from "@/components/role-management/RoleManagementContent";
import { Toaster } from "@/components/ui/toaster";

export default function RoleManagement() {
  const { 
    users, 
    isLoadingUsers, 
    availableRoles, 
    assignRole, 
    removeRole,
    isAssigningRole 
  } = useRoleManagement();

  return (
    <AccessControl>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Role Management</h1>
        <p className="text-muted-foreground mb-8">
          Manage user roles and permissions across the platform
        </p>

        <RoleManagementContent 
          users={users}
          isLoadingUsers={isLoadingUsers}
          availableRoles={availableRoles}
          assignRole={assignRole}
          removeRole={removeRole}
          isAssigningRole={isAssigningRole}
        />

        <Toaster />
      </div>
    </AccessControl>
  );
}
