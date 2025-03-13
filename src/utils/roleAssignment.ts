
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

/**
 * Assigns a specific role to a user by ID
 * 
 * @param userId - The UUID of the user
 * @param role - The role to assign
 * @returns Promise resolving to a success message or error
 */
export const assignRoleToUser = async (userId: string, role: string): Promise<{ success: boolean; message: string }> => {
  try {
    // First, check if the user exists in the profiles table
    const { data: userData, error: userError } = await supabase
      .from("profiles")
      .select("email")
      .eq("id", userId);

    if (userError) {
      throw new Error(`Error fetching user data: ${userError.message}`);
    }

    if (!userData || userData.length === 0) {
      throw new Error(`User with ID ${userId} not found in profiles`);
    }

    // Get the user's email from the first result
    const userEmail = userData[0]?.email;

    // Check if user already has this role
    const { data: existingRole, error: checkError } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .eq("role", role);

    if (checkError) {
      throw new Error(`Error checking existing roles: ${checkError.message}`);
    }

    // If role already exists, return early
    if (existingRole && existingRole.length > 0) {
      return { success: true, message: "User already has this role" };
    }

    // Assign the role
    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role, email: userEmail }]);

    if (error) throw error;

    return { success: true, message: `Role ${role} assigned successfully to user ${userId}` };
  } catch (error: any) {
    console.error("Error assigning role:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Execute this function in your browser console to assign the role:
 * 
 * Example usage:
 * ```
 * import { assignRoleToUser } from "@/utils/roleAssignment";
 * assignRoleToUser("c65f14e1-81d4-46f3-9183-22e935936d0e", "manager_pro_platinum")
 *   .then(console.log)
 *   .catch(console.error);
 * ```
 */
