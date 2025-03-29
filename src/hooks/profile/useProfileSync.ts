
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook for handling profile synchronization between auth metadata and profiles table
 */
export const useProfileSync = () => {
  const { toast } = useToast();

  /**
   * Verifies if synchronization is needed between auth.users metadata and profiles table
   */
  const verifyProfileSync = async (userId: string, updates: any) => {
    try {
      // Get the current auth user metadata to compare
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user during sync verification:", userError);
        return false;
      }
      
      console.log("Current user metadata:", user?.user_metadata);
      
      // Get the current profile data to compare
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .single();
        
      if (profileError) {
        console.error("Error fetching profile during sync verification:", profileError);
        return false;
      }
      
      console.log("Current profile data:", profileData);
      
      // Check if sync is needed by comparing values
      const syncNeeded = (
        (updates.first_name && profileData.first_name !== updates.first_name) ||
        (updates.last_name && profileData.last_name !== updates.last_name) ||
        (updates.phone && profileData.phone !== updates.phone)
      );
      
      if (syncNeeded) {
        console.log("Sync verification detected mismatch, forcing sync...");
        return false; // Indicates sync needed
      }
      
      return true; // Everything is in sync
    } catch (error) {
      console.error("Error during sync verification:", error);
      return false;
    }
  };

  /**
   * Force synchronization between auth.users metadata and profiles table
   */
  const forceProfileSync = async (userId: string, setIsSyncing: (value: boolean) => void) => {
    setIsSyncing(true);
    try {
      // Get user metadata from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user metadata during force sync:", userError);
        throw userError;
      }
      
      if (!user?.user_metadata) {
        console.warn("No user metadata found during force sync");
        return false;
      }
      
      console.log("Force sync with auth metadata:", user.user_metadata);
      
      // Create update payload from user metadata
      const profileUpdate = {
        first_name: user.user_metadata.first_name || null,
        last_name: user.user_metadata.last_name || null,
        phone: user.user_metadata.phone || null
      };
      
      // Directly update the profiles table
      const { data: updateResult, error: updateError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", userId)
        .select();
        
      if (updateError) {
        console.error("Error during force sync to profiles table:", updateError);
        throw updateError;
      }
      
      console.log("Force sync completed successfully:", updateResult);
      
      toast({
        title: "Profile synchronized",
        description: "Your profile has been synchronized with your account data.",
      });
      
      return true;
    } catch (error) {
      console.error("Error during force profile sync:", error);
      toast({
        title: "Sync failed",
        description: "There was a problem synchronizing your profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    verifyProfileSync,
    forceProfileSync
  };
};
