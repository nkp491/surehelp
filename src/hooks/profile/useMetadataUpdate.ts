
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook for handling Supabase auth metadata updates
 */
export const useMetadataUpdate = () => {
  /**
   * Update user metadata in auth.users
   */
  const updateUserMetadata = async (metadata: Record<string, any>) => {
    if (Object.keys(metadata).length === 0) {
      return { success: true, data: null };
    }
    
    console.log("Updating user metadata with:", metadata);
    
    // Use updateUser with metadata
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    });
    
    if (error) {
      console.error("Error updating user metadata:", error);
      return { success: false, error };
    }
    
    console.log("User metadata updated successfully:", data);
    return { success: true, data };
  };
  
  /**
   * Update user email in auth.users
   */
  const updateUserEmail = async (email: string, currentEmail: string, userId: string) => {
    if (!email || email === currentEmail) {
      return { success: true, data: null };
    }
    
    console.log("Updating email to:", email);
    
    const { data, error } = await supabase.auth.updateUser({
      email: email
    });
    
    if (error) {
      console.error("Error updating email:", error);
      return { success: false, error };
    }
    
    console.log("Email update initiated");
    
    // Try to update email in user_roles table as well
    try {
      // Only attempt to update if user_roles table exists
      const { data: userRoles, error: checkError } = await supabase
        .from("user_roles")
        .select("id")
        .eq("user_id", userId)
        .limit(1);
        
      if (!checkError && userRoles && userRoles.length > 0) {
        const { error: rolesError } = await supabase
          .from("user_roles")
          .update({ email: email })
          .eq("user_id", userId);
          
        if (rolesError) {
          console.error("Error updating user_roles:", rolesError);
        }
      }
    } catch (rolesUpdateError) {
      console.error("Error checking/updating user_roles:", rolesUpdateError);
    }
    
    return { success: true, data };
  };
  
  return {
    updateUserMetadata,
    updateUserEmail
  };
};
