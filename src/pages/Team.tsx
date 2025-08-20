import { useProfileManagement } from "@/hooks/useProfileManagement";
import ProfileLoading from "@/components/profile/ProfileLoading";
import { TeamBulletinBoard } from "@/components/team/TeamBulletinBoard";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import RoleAssignCard from "@/components/common/RoleAssignCard";
import { roleService } from "@/services/roleService";

export default function BulletinsPage() {
  const { profile, loading } = useProfileManagement();
  const nonSubscribedRoles = roleService.getNonSubscribedRoles();

  if (loading) {
    return <ProfileLoading />;
  }

  const isManager =
    profile?.role?.includes("manager_pro") ||
    profile?.roles?.some((role) =>
      ["manager_pro", "manager_pro_gold", "manager_pro_platinum"].includes(role)
    );

  return (
    <RoleBasedRoute
      requiredRoles={[
        "manager_pro",
        "manager_pro_gold",
        "manager_pro_platinum",
        "beta_user",
        "system_admin",
      ]}
    >
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Team Bulletins</h1>
          <p className="text-muted-foreground">
            {isManager
              ? "Create and manage bulletins for your team members."
              : "View team bulletins and announcements."}
          </p>
        </div>

        {nonSubscribedRoles
          .filter((role) => role.includes("manager"))
          .map((role, index) => (
            <div key={index} className="mb-6">
              <RoleAssignCard role={role} />
            </div>
          ))}

        {/* Bulletins Section */}
        <div className="space-y-6">
          <TeamBulletinBoard teamId={undefined} />
        </div>
      </div>
    </RoleBasedRoute>
  );
}
