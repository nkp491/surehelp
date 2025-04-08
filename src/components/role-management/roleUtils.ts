
/**
 * Format role display text
 */
export const formatRoleName = (role: string) => {
  if (role === "beta_user") return "Beta User";
  if (role === "manager_pro_gold") return "Manager Pro Gold";
  if (role === "manager_pro_platinum") return "Manager Pro Platinum";
  if (role === "agent_pro") return "Agent Pro";
  if (role === "manager_pro") return "Manager Pro";
  if (role === "system_admin") return "System Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

/**
 * Get badge variant based on role
 */
export const getBadgeVariant = (role: string) => {
  switch (role) {
    case "manager_pro_platinum": return "outline";
    case "manager_pro_gold": return "outline"; 
    case "agent_pro": return "outline";
    case "manager_pro": return "default";
    case "beta_user": return "destructive";
    case "system_admin": return "outline";
    default: return "secondary";
  }
};

/**
 * Filter users based on search query
 */
export const filterUsers = (users: any[], searchQuery: string) => {
  return users.filter(user => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });
};
