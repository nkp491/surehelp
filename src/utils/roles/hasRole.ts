
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

    // Check if we've already verified admin status in this session
    try {
      const cachedAdminStatus = localStorage.getItem('is-system-admin');
      if (cachedAdminStatus === 'true') {
        console.log("Using cached admin status: true");
        return true;
      }
      
      // Also check sessionStorage which is even faster
      const sessionAdminStatus = sessionStorage.getItem('is-admin');
      if (sessionAdminStatus === 'true') {
        console.log("Using session storage admin status: true");
        return true;
      }
    } catch (e) {
      console.error("Error checking localStorage:", e);
    }

    const userId = session.session.user.id;
    console.log("Checking admin role for user:", userId);
    
    // Attempt to directly fetch user roles from the database
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (error) {
      console.error("Error checking admin role:", error);
      return false;
    }

    // Check if any of the roles is system_admin
    const isAdmin = Array.isArray(data) && data.some(role => role.role === "system_admin");
    console.log(`User ${userId} is${isAdmin ? '' : ' not'} a system admin. Roles:`, data?.map(r => r.role));
    
    // Cache the result for faster access
    if (isAdmin) {
      try {
        localStorage.setItem('is-system-admin', 'true');
        sessionStorage.setItem('is-admin', 'true');
        console.log("Cached admin status as true");
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
