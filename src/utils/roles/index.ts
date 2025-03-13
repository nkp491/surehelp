
// Export all role management functions from a single entry point
export { hasSystemAdminRole } from './hasRole';
export { assignRoleToUser } from './assignRole';
export { removeRoleFromUser } from './removeRole';
export { getUserRoles } from './getRoles';
export { bulkRoleOperation } from './bulkRoleOperations';

/**
 * Execute this function in your browser console to assign the role:
 * 
 * Example usage:
 * ```
 * import { assignRoleToUser } from "@/utils/roles";
 * assignRoleToUser("c65f14e1-81d4-46f3-9183-22e935936d0e", "manager_pro_platinum")
 *   .then(console.log)
 *   .catch(console.error);
 * ```
 */
