
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { AccessControl } from "@/components/role-management/AccessControl";
import { RoleManagementContent } from "@/components/role-management/RoleManagementContent";

export default function RoleManagement() {
  const { 
    users, 
    isLoadingUsers, 
    availableRoles, 
    assignRole, 
    removeRole,
    isAssigningRole 
  } = useRoleManagement();
  const { language } = useLanguage();
  const t = translations[language];

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
      </div>
    </AccessControl>
  );
}
