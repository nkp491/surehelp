
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to manage profile updates
 */
export const useProfileUpdate = (refetch: () => Promise<any>, invalidateProfile: () => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  async function updateProfile(updates: Partial<Profile>) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      // Create a clean copy of updates for database
      const { roles, ...updatesToSave } = updates as any;
      
      // Log what we're sending to debug
      console.log("Updating profile with:", updatesToSave);

      // Define user metadata fields to update
      const userMetadata: any = {};
      let hasMetadataUpdates = false;
      
      // Extract fields that should be saved in user metadata
      if (updatesToSave.first_name !== undefined) {
        userMetadata.first_name = updatesToSave.first_name;
        hasMetadataUpdates = true;
      }
      
      if (updatesToSave.last_name !== undefined) {
        userMetadata.last_name = updatesToSave.last_name;
        hasMetadataUpdates = true;
      }
      
      if (updatesToSave.phone !== undefined) {
        userMetadata.phone = updatesToSave.phone;
        hasMetadataUpdates = true;
      }
      
      // Update user metadata first
      if (hasMetadataUpdates) {
        console.log("Updating user metadata with:", userMetadata);
        
        const { data, error: authError } = await supabase.auth.updateUser({
          data: userMetadata
        });
        
        if (authError) {
          console.error("Error updating user metadata:", authError);
          throw authError;
        } else {
          console.log("User metadata updated successfully:", data);
        }
      }
      
      // Update email separately if needed
      if (updatesToSave.email !== undefined && updatesToSave.email !== session.user.email) {
        console.log("Updating email to:", updatesToSave.email);
        
        const { error: emailError } = await supabase.auth.updateUser({
          email: updatesToSave.email
        });
        
        if (emailError) {
          console.error("Error updating email:", emailError);
          throw emailError;
        } else {
          console.log("Email update initiated");
          
          // Try to update email in user_roles table as well
          try {
            const { error: rolesError } = await supabase
              .from("user_roles")
              .update({ email: updatesToSave.email })
              .eq("user_id", session.user.id);
              
            if (rolesError) {
              console.error("Error updating user_roles:", rolesError);
            }
          } catch (rolesUpdateError) {
            console.error("Error updating user_roles:", rolesUpdateError);
          }
        }
      }
      
      // Update profiles table - Ensure correct JSON serialization for JSON fields
      if (updatesToSave.privacy_settings) {
        if (typeof updatesToSave.privacy_settings !== 'string') {
          updatesToSave.privacy_settings = updatesToSave.privacy_settings;
        }
      }
      
      if (updatesToSave.notification_preferences) {
        if (typeof updatesToSave.notification_preferences !== 'string') {
          updatesToSave.notification_preferences = updatesToSave.notification_preferences;
        }
      }
      
      console.log("Updating profiles table with:", updatesToSave);
      
      // IMPORTANT: Always update the profile in the database, even if the fields are coming from user metadata
      // This ensures the profiles table stays in sync with auth user metadata
      const profileUpdate = {
        ...updatesToSave,
        // Explicitly include the metadata fields again to ensure they're updated in profiles table too
        first_name: userMetadata.first_name || updatesToSave.first_name,
        last_name: userMetadata.last_name || updatesToSave.last_name,
        phone: userMetadata.phone || updatesToSave.phone
      };
      
      console.log("Final profile update data:", profileUpdate);
      
      // Update profile in database
      const { data: updateResult, error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", session.user.id)
        .select();
        
      if (profileError) {
        console.error("Error updating profile in database:", profileError);
        throw profileError;
      }
      
      console.log("Profile updated successfully:", updateResult);
      
      // Invalidate the profile query to force a refetch
      invalidateProfile();
      
      // Refetch profile data to ensure we have the latest
      await refetch();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: error.message || "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
      throw error;
    }
  }

  return {
    updateProfile
  };
};
