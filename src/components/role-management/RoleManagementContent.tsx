import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesList } from "@/components/role-management/RolesList";
import { RoleDescriptions } from "@/components/role-management/RoleDescriptions";
import { UserWithRoles } from "@/hooks/useRoleAssignmentOnly";

interface RoleManagementContentProps {
  users: UserWithRoles[] | undefined;
  isLoadingUsers: boolean;
  error: Error | null;
  availableRoles: string[];
  assignRole: (data: {
    userId: string;
    role: string;
  }) => void;
  getUserLoading: (userId: string, loadingType: string) => boolean;
}

export const RoleManagementContent = memo(function RoleManagementContent({
  users,
  isLoadingUsers,
  error,
  availableRoles,
  assignRole,
  getUserLoading,
}: Readonly<RoleManagementContentProps>) {
  if (isLoadingUsers) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-red-600 mb-2">Access Denied</h3>
          <p className="text-muted-foreground mb-4">
            {error.message || "You don't have permission to access user role management."}
          </p>
          <p className="text-sm text-muted-foreground">
            Only users with system admin privileges can manage roles and view all users.
          </p>
        </div>
      </div>
    );
  }

  return (
    <Tabs defaultValue="users" className="w-full">
      <TabsList>
        <TabsTrigger value="users">Users & Roles</TabsTrigger>
        <TabsTrigger value="about">About Roles</TabsTrigger>
      </TabsList>
      <TabsContent value="users">
        <RolesList
          users={users || []}
          availableRoles={availableRoles}
          getUserLoading={getUserLoading}
          onAssignRole={assignRole}
        />
      </TabsContent>
      <TabsContent value="about">
        <RoleDescriptions />
      </TabsContent>
    </Tabs>
  );
});
