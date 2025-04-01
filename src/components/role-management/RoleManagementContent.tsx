
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RolesList } from "@/components/role-management/RolesList";
import { RoleDescriptions } from "@/components/role-management/RoleDescriptions";
import { TeamManagement } from "@/components/role-management/TeamManagement";
import { Skeleton } from "@/components/ui/skeleton";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface RoleManagementContentProps {
  users: UserWithRoles[] | undefined;
  isLoadingUsers: boolean;
  availableRoles: string[];
  assignRole: (data: { userId: string; email: string | null; role: string }) => void;
  removeRole: (data: { userId: string; role: string }) => void;
  isAssigningRole: boolean;
}

export function RoleManagementContent({ 
  users, 
  isLoadingUsers, 
  availableRoles, 
  assignRole, 
  removeRole,
  isAssigningRole 
}: RoleManagementContentProps) {
  const { hasRequiredRole } = useRoleCheck();
  const isAdmin = hasRequiredRole(['system_admin']);
  
  return (
    <Tabs defaultValue="users">
      <TabsList className="mb-6">
        <TabsTrigger value="users">Users & Roles</TabsTrigger>
        <TabsTrigger value="about">About Roles</TabsTrigger>
        {isAdmin && <TabsTrigger value="teams">Team Management</TabsTrigger>}
      </TabsList>
      
      <TabsContent value="users">
        {isLoadingUsers ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-48 w-full" />
          </div>
        ) : (
          <RolesList
            users={users || []}
            availableRoles={availableRoles}
            onAssignRole={assignRole}
            onRemoveRole={removeRole}
            isAssigningRole={isAssigningRole}
          />
        )}
      </TabsContent>
      
      <TabsContent value="about">
        <RoleDescriptions />
      </TabsContent>
      
      {isAdmin && (
        <TabsContent value="teams">
          <TeamManagement />
        </TabsContent>
      )}
    </Tabs>
  );
}
