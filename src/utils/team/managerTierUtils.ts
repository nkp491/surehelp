
import { ManagerRole, ManagerTierPermissions, DEFAULT_MANAGER_PERMISSIONS } from "@/types/team-hierarchy";

/**
 * Get the permissions for a specific manager tier
 * 
 * @param role The manager role to check permissions for
 * @returns The permissions object for the specified role
 */
export const getManagerPermissions = (role?: string): ManagerTierPermissions => {
  if (!role) {
    return DEFAULT_MANAGER_PERMISSIONS.manager_pro;
  }
  
  if (role === 'system_admin') {
    // System admins have all permissions of platinum managers
    return DEFAULT_MANAGER_PERMISSIONS.manager_pro_platinum;
  }
  
  // Check if the role is one of our manager roles
  if (role in DEFAULT_MANAGER_PERMISSIONS) {
    return DEFAULT_MANAGER_PERMISSIONS[role as ManagerRole];
  }
  
  // Default to basic manager permissions
  return DEFAULT_MANAGER_PERMISSIONS.manager_pro;
};

/**
 * Check if a manager role has a specific permission
 * 
 * @param managerRole The manager role to check
 * @param permissionKey The permission key to check
 * @returns Boolean indicating if the role has the permission
 */
export const hasManagerPermission = (
  managerRole: string | undefined, 
  permissionKey: keyof ManagerTierPermissions
): boolean => {
  if (!managerRole) return false;
  
  // System admins always have all permissions
  if (managerRole === 'system_admin') return true;
  
  const permissions = getManagerPermissions(managerRole);
  return !!permissions[permissionKey];
};

/**
 * Get the tier level of a manager role (1 = basic, 2 = gold, 3 = platinum)
 * 
 * @param role The manager role
 * @returns Number representing the tier level (0 if not a manager)
 */
export const getManagerTierLevel = (role?: string): number => {
  if (!role) return 0;
  
  if (role === 'system_admin') return 3; // System admins are at the platinum level
  
  const tierLevels: Record<ManagerRole, number> = {
    'manager_pro': 1,
    'manager_pro_gold': 2,
    'manager_pro_platinum': 3
  };
  
  return role in tierLevels ? tierLevels[role as ManagerRole] : 0;
};

/**
 * Check if a manager can access a certain tier of functionality
 * 
 * @param role The manager role
 * @param requiredTier The minimum tier required ('pro', 'gold', 'platinum')
 * @returns Boolean indicating if the manager has the required tier
 */
export const hasRequiredManagerTier = (
  role: string | undefined, 
  requiredTier: 'pro' | 'gold' | 'platinum'
): boolean => {
  if (!role) return false;
  
  // System admins have access to all tiers
  if (role === 'system_admin') return true;
  
  const tierLevels = {
    'pro': 1,
    'gold': 2,
    'platinum': 3
  };
  
  const requiredLevel = tierLevels[requiredTier];
  const userLevel = getManagerTierLevel(role);
  
  return userLevel >= requiredLevel;
};
