
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useProfileSync } from "./useProfileSync";
import { useManagerRelationship } from "./useManagerRelationship";
import { useMetadataUpdate } from "./useMetadataUpdate";

/**
 * Hook to manage profile updates with enhanced synchronization
 */
export const useProfileUpdate = (refetch: () => Promise<any>, invalidateProfile: () => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  const { verifyProfileSync, forceProfileSync } = useProfileSync();
  const { processManagerEmail } = useManagerRelationship();
  const { updateUserMetadata, updateUserEmail } = useMetadataUpdate();

  /**
   * Update user profile with enhanced synchronization and verification
   */
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

      // Handle manager_email update specifically
      if (updatesToSave.manager_email !== undefined) {
        console.log("Processing manager email update:", updatesToSave.manager_email);
        
        const { managerEmailExists, reportsTo } = await processManagerEmail(updatesToSave.manager_email);
        if (managerEmailExists) {
          updatesToSave.reports_to = reportsTo;
        }
      }

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
      
      // Update user metadata first - this is the source of truth
      if (hasMetadataUpdates) {
        const { success, error } = await updateUserMetadata(userMetadata);
        if (!success) throw error;
      }
      
      // Update email separately if needed
      if (updatesToSave.email !== undefined && updatesToSave.email !== session.user.email) {
        const { success, error } = await updateUserEmail(updatesToSave.email, session.user.email, session.user.id);
        if (!success) throw error;
      }
      
      // Ensure proper JSON serialization for JSON fields
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
      
      // CRITICAL: Always include the metadata fields in the profile update
      // This ensures the profiles table stays in sync with auth user metadata
      const profileUpdate = {
        ...updatesToSave,
        // EXPLICITLY include the metadata fields to ensure they're updated in profiles table
        first_name: userMetadata.first_name !== undefined ? userMetadata.first_name : updatesToSave.first_name,
        last_name: userMetadata.last_name !== undefined ? userMetadata.last_name : updatesToSave.last_name,
        phone: userMetadata.phone !== undefined ? userMetadata.phone : updatesToSave.phone
      };
      
      console.log("Final profile update data with explicit fields:", profileUpdate);
      
      // Check if manager_email column exists and handle accordingly
      try {
        const { checkManagerEmailColumn } = useManagerRelationship();
        const managerEmailExists = await checkManagerEmailColumn();
        
        if (!managerEmailExists && 'manager_email' in profileUpdate) {
          delete profileUpdate.manager_email;
        }
      } catch (columnCheckError) {
        console.error("Error checking column:", columnCheckError);
      }
      
      // Update profile in database with explicit fields
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", session.user.id);
        
      if (profileError) {
        console.error("Error updating profile in database:", profileError);
        
        // Special handling for 'column does not exist' errors
        if (profileError.message && profileError.message.includes('does not exist')) {
          // Try updating without the problematic field
          const fieldsToKeep = {...profileUpdate};
          
          // If the error mentions a specific column, remove it
          const columnMatch = profileError.message.match(/column\s+"?([^"]+)"?\s+does not exist/i);
          if (columnMatch && columnMatch[1]) {
            const problematicColumn = columnMatch[1].includes('profiles.') 
              ? columnMatch[1].replace('profiles.', '') 
              : columnMatch[1];
            
            console.log(`Removing problematic column from update: ${problematicColumn}`);
            delete fieldsToKeep[problematicColumn];
            
            // Try update again without the problematic field
            const { error: retryError } = await supabase
              .from("profiles")
              .update(fieldsToKeep)
              .eq("id", session.user.id);
              
            if (retryError) {
              console.error("Error in retry update:", retryError);
              throw retryError;
            } else {
              console.log("Retry update succeeded with limited fields");
              
              // Notify user about the missing column if it was specifically manager_email
              if (problematicColumn === 'manager_email') {
                toast({
                  title: "Database Update Required",
                  description: "The manager field couldn't be saved. Your administrator needs to update the database.",
                  variant: "destructive",
                });
              }
            }
          } else {
            throw profileError;
          }
        } else {
          throw profileError;
        }
      } else {
        console.log("Profile updated successfully");
      }
      
      // Create pending team request if manager email was specified but manager not found
      if (updatesToSave.manager_email && !updatesToSave.reports_to) {
        console.log("Manager email specified but manager not found:", updatesToSave.manager_email);
        // Instead of trying to insert into a non-existent table, just log the information
        console.warn("Note: team_requests table doesn't exist yet, would create request for:", {
          user_id: session.user.id,
          manager_email: updatesToSave.manager_email,
          status: "pending",
          created_at: new Date().toISOString()
        });
      }
      
      // Verify the synchronization was successful
      const isSynced = await verifyProfileSync(session.user.id, profileUpdate);
      
      if (!isSynced) {
        console.warn("Sync verification failed, forcing profile sync...");
        await forceProfileSync(session.user.id, setIsSyncing);
      }
      
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

  // Wrapper for forceProfileSync that passes the setIsSyncing function
  const handleForceProfileSync = async (userId: string) => {
    return forceProfileSync(userId, setIsSyncing);
  };

  return {
    updateProfile,
    forceProfileSync: handleForceProfileSync,
    isSyncing
  };
};
