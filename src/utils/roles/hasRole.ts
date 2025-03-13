
import { supabase } from "@/integrations/supabase/client";

/**
 * Checks if the current user has the system_admin role
 * 
 * @returns Promise resolving to a boolean indicating if user has admin role
 */
export const hasSystemAdminRole = async (): Promise<boolean> => {
  try {
    const { data: session } = await supabase.auth.getSession();
    if (!session?.session?.user?.id) {
      return false;
    }

    const { data, error } = await supabase
      .from("user_roles")
      .select("*")
      .eq("user_id", session.session.user.id)
      .eq("role", "system_admin");

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    return data && data.length > 0;
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};
