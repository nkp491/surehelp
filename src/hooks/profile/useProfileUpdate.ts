
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useQueryClient } from "@tanstack/react-query";

/**
 * Hook to handle profile updates
 */
export const useProfileUpdate = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      console.log("updateProfile called with data:", updates);
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.error("No active session found");
        return false;
      }

      console.log("Current user ID:", session.user.id);

      // Create a clean copy of updates for database
      const { roles, ...updatesToSave } = updates as any;
      
      // Handle JSON fields properly
      if (updatesToSave.privacy_settings && typeof updatesToSave.privacy_settings !== 'string') {
        updatesToSave.privacy_settings = JSON.stringify(updatesToSave.privacy_settings);
      }
      
      if (updatesToSave.notification_preferences && typeof updatesToSave.notification_preferences !== 'string') {
        updatesToSave.notification_preferences = JSON.stringify(updatesToSave.notification_preferences);
      }
      
      // Handle agent_info field properly
      if (updatesToSave.agent_info) {
        console.log("Updating agent info:", updatesToSave.agent_info);
      }

      // Handle manager_id specifically when updating
      if (updatesToSave.manager_id !== undefined) {
        console.log("Updating manager_id to:", updatesToSave.manager_id);
      }

      // Log what we're sending to debug
      console.log("Updating profile with:", updatesToSave);

      // Use .eq instead of .match for more reliable updating
      const { data, error } = await supabase
        .from("profiles")
        .update(updatesToSave)
        .eq("id", session.user.id)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Error details:", error);
        throw error;
      }
      
      // If email is updated, update it in user_roles table as well
      if (updates.email) {
        console.log("Updating email in user_roles:", updates.email);
        const { error: rolesError } = await supabase
          .from("user_roles")
          .update({ email: updates.email })
          .eq("user_id", session.user.id);
          
        if (rolesError) {
          console.error("Error updating user_roles:", rolesError);
          throw rolesError;
        }
      }
      
      // Invalidate and refetch profile data to ensure we have the latest
      await queryClient.invalidateQueries({ queryKey: ['profile'] });
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });

      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return { updateProfile };
};
