
import { supabase } from "@/integrations/supabase/client";
import { hasSystemAdminRole } from "./hasRole";

/**
 * Removes a specific role from a user by ID
 * 
 * @param userId - The UUID of the user
 * @param role - The role to remove
 * @returns Promise resolving to a success message or error
 */
export const removeRoleFromUser = async (userId: string, role: string): Promise<{ success: boolean; message: string }> => {
  try {
    // First check if current user has system_admin role
    const isAdmin = await hasSystemAdminRole();
    if (!isAdmin) {
      return { success: false, message: "You must have system_admin role to remove roles" };
    }

    // Check if user has this role before removing
    const { data: existingRole, error: checkError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", role);

    if (checkError) {
      throw new Error(`Error checking existing roles: ${checkError.message}`);
    }

    // If role doesn't exist, return early
    if (!existingRole || existingRole.length === 0) {
      return { success: false, message: "User does not have this role" };
    }

    // Remove the role
    const { error } = await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("role", role);

    if (error) throw error;

    return { success: true, message: `Role ${role} removed successfully from user ${userId}` };
  } catch (error: any) {
    console.error("Error removing role:", error);
    return { success: false, message: error.message };
  }
};
