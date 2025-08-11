import { UserWithRoles } from "@/hooks/useRoleManagement";

export const formatRoleName = (role: string) => {
  if (role === "beta_user") return "Beta User";
  if (role === "manager_pro_gold") return "Manager Pro Gold";
  if (role === "manager_pro_platinum") return "Manager Pro Platinum";
  if (role === "agent_pro") return "Agent Pro";
  if (role === "manager_pro") return "Manager Pro";
  if (role === "system_admin") return "System Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getBadgeVariant = (role: string) => {
  switch (role) {
    case "manager_pro_platinum":
      return "outline";
    case "manager_pro_gold":
      return "outline";
    case "agent_pro":
      return "outline";
    case "manager_pro":
      return "default";
    case "beta_user":
      return "destructive";
    case "system_admin":
      return "outline";
    default:
      return "secondary";
  }
};

export const filterUsers = (
  users: UserWithRoles[],
  searchQuery: string
): UserWithRoles[] => {
  if (!searchQuery.trim()) {
    return users;
  }
  const query = searchQuery.toLowerCase().trim();
  const results: UserWithRoles[] = [];
  for (const user of users) {
    const firstName = (user.first_name || "").toLowerCase();
    const lastName = (user.last_name || "").toLowerCase();
    const email = (user.email || "").toLowerCase();
    const fullName = `${firstName} ${lastName}`.trim();
    if (
      firstName.indexOf(query) !== -1 ||
      lastName.indexOf(query) !== -1 ||
      email.indexOf(query) !== -1 ||
      fullName.indexOf(query) !== -1
    ) {
      results.push(user);
    }
  }

  return results;
};
