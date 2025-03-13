
import { supabase } from "@/integrations/supabase/client";
import { hasSystemAdminRole } from "./hasRole";

/**
 * Gets all roles assigned to a user by ID
 * 
 * @param userId - The UUID of the user
 * @returns Promise resolving to a list of roles or error
 */
export const getUserRoles = async (userId: string): Promise<{ success: boolean; roles?: string[]; message: string; email?: string | null; firstName?: string | null; lastName?: string | null }> => {
  try {
    // First check if current user has system_admin role
    const isAdmin = await hasSystemAdminRole();
    if (!isAdmin) {
      return { success: false, message: "You must have system_admin role to view user roles" };
    }

    // Check if the user exists in the profiles table
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("email, first_name, last_name")
      .eq("id", userId)
      .single();

    if (userError) {
      throw new Error(`Error fetching user data: ${userError.message}`);
    }

    if (!userData) {
      return { success: false, message: `User with ID ${userId} not found in profiles` };
    }

    // Get the user's roles
    const { data: userRoles, error: rolesError } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (rolesError) {
      throw new Error(`Error fetching user roles: ${rolesError.message}`);
    }

    // Extract roles from the data
    const roles = userRoles.map(item => item.role);

    return { 
      success: true, 
      roles, 
      message: roles.length > 0 ? "Roles retrieved successfully" : "User has no assigned roles",
      email: userData.email,
      firstName: userData.first_name,
      lastName: userData.last_name
    };
  } catch (error: any) {
    console.error("Error getting user roles:", error);
    return { success: false, message: error.message };
  }
};
