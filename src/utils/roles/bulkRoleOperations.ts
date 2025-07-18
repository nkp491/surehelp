
import { assignRoleToUser } from "./assignRole";
import { removeRoleFromUser } from "./removeRole";
import { hasSystemAdminRole } from "./hasRole";

/**
 * Performs bulk role operations (assign or remove) for multiple users
 */
export const bulkRoleOperation = async ({
  userIds,
  role,
  action,
  subscribedUser
}: {
  userIds: string[];
  role: string;
  action: "assign" | "remove";
  subscribedUser?: any[];
}): Promise<{ 
  success: boolean; 
  message: string; 
  results?: { userId: string; success: boolean; message: string }[]
}> => {
  try {
    // First check if current user has system_admin role
    const isAdmin = await hasSystemAdminRole();
    if (!isAdmin) {
      return { success: false, message: "You must have system_admin role to perform bulk role operations" };
    }

    if (!userIds.length) {
      return { success: false, message: "No users selected for bulk operation" };
    }

    const results = [];
    let successCount = 0;
    let failCount = 0;

    // Process each user
    for (const userId of userIds) {
      let result;
      
      if (action === "assign") {
        result = await assignRoleToUser(userId, role);
      } else {

        result = await removeRoleFromUser(userId, role);
      }
      
      results.push({ userId, success: result.success, message: result.message });
      
      if (result.success) {
        successCount++;
      } else {
        failCount++;
      }
    }

    let statusMessage;
    if (failCount === 0) {
      statusMessage = `Successfully ${action === "assign" ? "assigned" : "removed"} role ${role} for all ${successCount} users`;
    } else if (successCount === 0) {
      statusMessage = `Failed to ${action === "assign" ? "assign" : "remove"} role for any users`;
    } else {
      statusMessage = `Completed with ${successCount} successes and ${failCount} failures`;
    }

    return { 
      success: successCount > 0, 
      message: statusMessage,
      results 
    };
  } catch (error: any) {
    console.error("Error in bulk role operation:", error);
    return { success: false, message: error.message || "An unexpected error occurred" };
  }
};



async function revokeSubscription (userId: string, planId: string) {
  
}