import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesList } from "@/components/role-management/RolesList";
import { RoleDescriptions } from "@/components/role-management/RoleDescriptions";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { useState } from "react";

interface RoleManagementContentProps {
  users: UserWithRoles[] | undefined;
  isLoadingUsers: boolean;
  availableRoles: string[];
  assignRole: (data: { userId: string; email: string | null; role: string }) => void;
  removeRole: (data: { userId: string; role: string }) => void;
  assignManager: (data: { userId: string; managerId: string | null }) => void;
  isAssigningRole: boolean;
}

export function RoleManagementContent({
  users,
  isLoadingUsers,
  availableRoles,
  assignRole,
  removeRole,
  assignManager,
  isAssigningRole
}: RoleManagementContentProps) {
  const [activeTab, setActiveTab] = useState<"users" | "about">("users");

  if (isLoadingUsers) {
    return <div>Loading...</div>;
  }

  return (
    <div>
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
            onAssignRole={assignRole}
            onRemoveRole={removeRole}
            onAssignManager={assignManager}
          />
        </TabsContent>
        <TabsContent value="about">
          <RoleDescriptions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
