import { useRolesCache } from "./useRolesCache";

export function useRoleCheck() {
  const { userRoles, isLoadingRoles, refetchRoles } = useRolesCache();

  // Check if user has at least one of the required roles
  const hasRequiredRole = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (userRoles.length === 0) return false;
    
    return userRoles.some(role => requiredRoles.includes(role));
  };

  // Get the highest tier role the user has
  const getHighestRole = () => {
    const roleHierarchy = [
      'agent',
      'agent_pro',
      'manager_pro',
      'manager_pro_gold',
      'manager_pro_platinum',
      'beta_user',
      'system_admin'
    ];
    
    let highestRoleIndex = -1;
    
    userRoles.forEach(role => {
      const index = roleHierarchy.indexOf(role);
      if (index > highestRoleIndex) {
        highestRoleIndex = index;
      }
    });
    
    return highestRoleIndex >= 0 ? roleHierarchy[highestRoleIndex] : null;
  };

  // Check if user can be upgraded to a higher tier role
  const canUpgradeTo = (role: string) => {
    const roleHierarchy = [
      'agent',
      'agent_pro',
      'manager_pro',
      'manager_pro_gold',
      'manager_pro_platinum'
    ];
    
    const currentRoleIndex = roleHierarchy.indexOf(getHighestRole() || '');
    const targetRoleIndex = roleHierarchy.indexOf(role);
    
    return currentRoleIndex < targetRoleIndex;
  };

  return { 
    userRoles, 
    isLoadingRoles, 
    refetchRoles,
    hasRequiredRole, 
    getHighestRole, 
    canUpgradeTo 
  };
}
