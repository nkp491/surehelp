
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the current user has the system_admin role using security definer function
 * to avoid RLS recursion issues
 * 
 * @returns Promise resolving to a boolean indicating if user has admin role
 */
export const hasSystemAdminRole = async (): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      return false;
    }

    // Use the security definer function to check role
    const { data, error } = await supabase.rpc(
      'user_has_role',
      { 
        check_user_id: session.session.user.id,
        check_role: 'system_admin'
      }
    );

    if (error) {
      console.error("Error checking admin role:", error);
      
      // Fall back to direct query if RPC fails
      const { data: roleData, error: roleError } = await supabase
        .from("user_roles")
        .select("*")
        .eq("user_id", session.session.user.id)
        .eq("role", "system_admin");

      if (roleError) {
        console.error("Error in fallback admin role check:", roleError);
        return false;
      }

      return roleData && roleData.length > 0;
    }

    return !!data;
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};
