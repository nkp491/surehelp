import { memo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesList } from "@/components/role-management/RolesList";
import { RoleDescriptions } from "@/components/role-management/RoleDescriptions";
import { UserWithRoles } from "@/hooks/useRoleManagement";

interface RoleManagementContentProps {
  users: UserWithRoles[] | undefined;
  isLoadingUsers: boolean;
  availableRoles: string[];
  assignRole: (data: {
    userId: string;
    email: string | null;
    role: string;
  }) => void;
  removeRole: (data: { userId: string; role: string }) => void;
  assignManager: (data: { userId: string; managerId: string | null }) => void;
  isAssigningRole: boolean;
  isAssigningManager: boolean;
  isRemovingRole: boolean;
  isRemovingManager: boolean;
  getUserLoading: (userId: string, loadingType: string) => boolean;
}

export const RoleManagementContent = memo(function RoleManagementContent({
  users,
  isLoadingUsers,
  availableRoles,
  assignRole,
  removeRole,
  assignManager,
  isAssigningRole,
  isAssigningManager,
  isRemovingRole,
  isRemovingManager,
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
          isAssigningRole={isAssigningRole}
          isAssigningManager={isAssigningManager}
          isRemovingRole={isRemovingRole}
          isRemovingManager={isRemovingManager}
          getUserLoading={getUserLoading}
          onAssignRole={assignRole}
          onRemoveRole={removeRole}
          onAssignManager={assignManager}
        />
      </TabsContent>
      <TabsContent value="about">
        <RoleDescriptions />
      </TabsContent>
    </Tabs>
  );
});
