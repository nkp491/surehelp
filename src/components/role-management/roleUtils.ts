
import { UserWithRoles } from "@/hooks/useRoleManagement";

// Format role name for display
export const formatRoleName = (role: string): string => {
  // Convert snake_case to Title Case
  return role
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

// Get badge variant based on role
export const getBadgeVariant = (role: string) => {
  switch (role) {
    case "system_admin":
      return "destructive";
    case "manager_pro_platinum":
      return "outline";
    case "manager_pro_gold":
      return "warning";
    case "manager_pro":
      return "default";
    case "agent_pro":
      return "info";
    case "beta_user":
      return "success";
    default:
      return "secondary";
  }
};

// Filter users based on search query
export const filterUsers = (
  users: UserWithRoles[] | undefined,
  searchQuery: string
): UserWithRoles[] => {
  if (!users) return [];
  if (!searchQuery.trim()) return users;

  const query = searchQuery.toLowerCase();
  
  return users.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });
};
