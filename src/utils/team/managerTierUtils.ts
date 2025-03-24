
import { DEFAULT_MANAGER_PERMISSIONS, ManagerRole, ManagerTierPermissions } from "@/types/team-hierarchy";

/**
 * Check if a user's role has a specific manager permission
 */
export function hasManagerPermission(role: string, permission: keyof ManagerTierPermissions) {
  // System admins have all permissions
  if (role === 'system_admin') {
    return DEFAULT_MANAGER_PERMISSIONS['manager_pro_platinum'][permission];
  }
  
  // If role is a known manager role, check its permissions
  if (role in DEFAULT_MANAGER_PERMISSIONS) {
    return DEFAULT_MANAGER_PERMISSIONS[role as ManagerRole][permission];
  }
  
  // For non-manager roles, return false
  return false;
}

/**
 * Get all manager permissions for a role
 */
export function getManagerPermissions(role: string): ManagerTierPermissions {
  // System admins have platinum level permissions
  if (role === 'system_admin') {
    return DEFAULT_MANAGER_PERMISSIONS['manager_pro_platinum'];
  }
  
  // If role is a known manager role, return its permissions
  if (role in DEFAULT_MANAGER_PERMISSIONS) {
    return DEFAULT_MANAGER_PERMISSIONS[role as ManagerRole];
  }
  
  // For non-manager roles, return empty permissions
  return {
    canViewHierarchy: false,
    canViewSubteams: false,
    canViewAdvancedMetrics: false,
    canExportTeamData: false,
    canManageSubteams: false,
    maxTeamDepth: 0,
    maxMembersPerTeam: 0
  };
}
