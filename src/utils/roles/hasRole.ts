
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
      console.log("No active session found");
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

    const isAdmin = data && data.length > 0;
    console.log(`User ${session.session.user.id} is${isAdmin ? '' : ' not'} a system admin`);
    
    // Cache the result for faster access
    if (isAdmin) {
      try {
        localStorage.setItem('is-system-admin', 'true');
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
    }
    
    return isAdmin;
  } catch (error) {
    console.error("Error checking admin role:", error);
    return false;
  }
};
