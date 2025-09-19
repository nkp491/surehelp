
import { supabase } from "@/integrations/supabase/client";
import { hasSystemAdminRole } from "./hasRole";
import { canAddTeamMember, TEAM_LIMITS } from "@/utils/teamLimits";

/**
 * Assigns a specific role to a user by ID
 * 
 * @param userId - The UUID of the user
 * @param role - The role to assign
 * @returns Promise resolving to a success message or error
 */
export const assignRoleToUser = async (userId: string, role: string): Promise<{ success: boolean; message: string }> => {
  try {
    // First check if current user has system_admin role
    const isAdmin = await hasSystemAdminRole();
    if (!isAdmin) {
      return { success: false, message: "You must have system_admin role to assign roles" };
    }

    // Check if the user exists in the profiles table
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

    // Check team limits for manager roles
    const managerRoles = Object.keys(TEAM_LIMITS) as Array<keyof typeof TEAM_LIMITS>;
    if (managerRoles.includes(role as keyof typeof TEAM_LIMITS)) {
      const limitCheck = await canAddTeamMember(userId);
      
      if (!limitCheck.canAdd) {
        const limitText = limitCheck.limit === Infinity ? "unlimited" : limitCheck.limit.toString();
        return { 
          success: false, 
          message: `Cannot assign ${role} role. Team member limit reached (${limitCheck.currentCount}/${limitText} members).` 
        };
      }
    }

    // Assign the role
    const { error } = await supabase
      .from("user_roles")
      .insert([{ user_id: userId, role, email: userEmail }]);

    if (error) throw error;

    return { success: true, message: `Role ${role} assigned successfully to user ${userId}` };
  } catch (error) {
    console.error("Error assigning role:", error);
    return { success: false, message: error.message };
  }
};
