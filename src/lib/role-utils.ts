
/**
 * Role hierarchy from lowest to highest permission level
 */
export const ROLE_HIERARCHY = [
  'agent',
  'agent_pro',
  'manager_pro',
  'manager_pro_gold',
  'manager_pro_platinum',
  'beta_user',
  'system_admin'
];

/**
 * Check if a user has the system_admin role
 */
export const checkSystemAdminRole = (roles: string[]): boolean => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return false;
  }
  
  return roles.includes('system_admin');
};

/**
 * Check if a user has any of the required roles
 */
export const checkRequiredRole = (userRoles: string[], requiredRoles?: string[]): boolean => {
  // Log role check to help with debugging
  console.log('Checking roles:', { userRoles, requiredRoles });
  
  if (!requiredRoles || requiredRoles.length === 0) return true;
  
  // Ensure userRoles is an array
  const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
  
  // Special case: check system_admin first as it supersedes all other roles
  if (userRolesArray.includes('system_admin')) {
    console.log('User has system_admin role, granting access');
    return true;
  }
  
  // Special case: empty user roles array
  if (userRolesArray.length === 0) {
    console.log('User has no roles, denying access');
    return false;
  }
  
  // Check if user has any of the required roles
  const hasRole = userRolesArray.some(role => requiredRoles.includes(role));
  console.log('Role check result:', hasRole);
  return hasRole;
};

/**
 * Get the highest tier role from a user's roles
 */
export const getHighestRole = (userRoles: string[]): string | null => {
  let highestRoleIndex = -1;
  
  // Ensure userRoles is an array
  const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
  
  userRolesArray.forEach(role => {
    const index = ROLE_HIERARCHY.indexOf(role);
    if (index > highestRoleIndex) {
      highestRoleIndex = index;
    }
  });
  
  return highestRoleIndex >= 0 ? ROLE_HIERARCHY[highestRoleIndex] : null;
};

/**
 * Check if user can be upgraded to a higher tier role
 */
export const canUpgradeTo = (currentRoles: string[], targetRole: string): boolean => {
  const currentHighestRole = getHighestRole(currentRoles);
  
  const currentRoleIndex = ROLE_HIERARCHY.indexOf(currentHighestRole || '');
  const targetRoleIndex = ROLE_HIERARCHY.indexOf(targetRole);
  
  return currentRoleIndex < targetRoleIndex;
};
