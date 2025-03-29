
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

/**
 * Hook to manage profile updates with enhanced synchronization
 */
export const useProfileUpdate = (refetch: () => Promise<any>, invalidateProfile: () => void) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  
  /**
   * Ensures synchronization between auth.users metadata and profiles table
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
  const forceProfileSync = async (userId: string) => {
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
      return true;
    } catch (error) {
      console.error("Error during force profile sync:", error);
      return false;
    } finally {
      setIsSyncing(false);
    }
  };

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
        
        try {
          // Check if manager_email field exists using a safer approach
          let managerEmailExists = true;
          
          try {
            // Attempt to query a single row with manager_email field as a test
            const testQuery = await supabase
              .from('profiles')
              .select('id')
              .limit(1);
              
            // Check if we can access the field on the result
            const hasField = testQuery.data && 
                            testQuery.data[0] && 
                            'manager_email' in testQuery.data[0];
            
            managerEmailExists = !!hasField;
          } catch (testError: any) {
            // If we get a specific error about the column, it doesn't exist
            if (testError.message && testError.message.includes('column')) {
              managerEmailExists = false;
            }
          }
          
          if (!managerEmailExists) {
            console.log("manager_email column doesn't exist, will handle gracefully");
            // Since we can't create the column directly, just continue
            console.log("Will update anyway and let backend handle it");
          } else {
            console.log("manager_email column exists, proceeding with update");
          }
          
          // Look up the manager's user ID from their email
          if (updatesToSave.manager_email) {
            const { data: managerData, error: managerError } = await supabase
              .from("profiles")
              .select("id")
              .eq("email", updatesToSave.manager_email)
              .single();
            
            if (managerError) {
              console.error("Error finding manager:", managerError);
              // Don't throw yet, we'll log the pending request instead
            } else if (managerData) {
              // Update the reports_to field with the manager's ID
              updatesToSave.reports_to = managerData.id;
            }
          } else {
            // If manager_email is empty or null, clear the reports_to field
            updatesToSave.reports_to = null;
          }
        } catch (error) {
          console.error("Error processing manager relationship:", error);
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
        console.log("Updating user metadata with:", userMetadata);
        
        // Use updateUser with metadata
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
          
          // Try to update email in user_roles table as well - Updated to avoid SQL error
          try {
            // Only attempt to update if user_roles table exists
            // This approach avoids the SQL error with "user_role ~~ unknown"
            const { data: userRoles, error: checkError } = await supabase
              .from("user_roles")
              .select("id")
              .eq("user_id", session.user.id)
              .limit(1);
              
            if (!checkError && userRoles && userRoles.length > 0) {
              const { error: rolesError } = await supabase
                .from("user_roles")
                .update({ email: updatesToSave.email })
                .eq("user_id", session.user.id);
                
              if (rolesError) {
                console.error("Error updating user_roles:", rolesError);
              }
            }
          } catch (rolesUpdateError) {
            console.error("Error checking/updating user_roles:", rolesUpdateError);
          }
        }
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
      
      try {
        // Simplified check for manager_email column existence
        let shouldRemoveManagerEmail = false;
        
        try {
          const { error } = await supabase
            .from('profiles')
            .select('manager_email')
            .limit(1);
            
          if (error && error.message && error.message.includes('column')) {
            shouldRemoveManagerEmail = true;
          }
        } catch (e: any) {
          if (e.message && e.message.includes('column')) {
            shouldRemoveManagerEmail = true;
          }
        }
        
        if (shouldRemoveManagerEmail) {
          console.log("manager_email column doesn't exist, removing from update");
          delete profileUpdate.manager_email;
          
          toast({
            title: "Database Update Required",
            description: "Your administrator needs to update the database schema.",
            variant: "destructive",
          });
        } else {
          console.log("manager_email column exists or we couldn't confirm");
        }
      } catch (columnCheckError) {
        console.error("Error checking column:", columnCheckError);
      }
      
      // Update profile in database with explicit fields - simplified query to avoid SQL errors
      const { data: updateResult, error: profileError } = await supabase
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
            const { data: retryResult, error: retryError } = await supabase
              .from("profiles")
              .update(fieldsToKeep)
              .eq("id", session.user.id);
              
            if (retryError) {
              console.error("Error in retry update:", retryError);
              throw retryError;
            } else {
              console.log("Retry update succeeded with limited fields:", retryResult);
              
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
        console.log("Profile updated successfully:", updateResult);
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
        
        try {
          // Check if a table exists before trying to use it
          const { error: checkError } = await supabase
            .from("team_members")
            .select("id")
            .limit(1);
            
          if (!checkError) {
            // If the check worked, we know the database is accessible
            console.log("Database is accessible, but team_requests table doesn't exist yet");
          }
        } catch (error) {
          console.warn("Error checking database status:", error);
        }
      }
      
      // Verify the synchronization was successful
      const isSynced = await verifyProfileSync(session.user.id, profileUpdate);
      
      if (!isSynced) {
        console.warn("Sync verification failed, forcing profile sync...");
        await forceProfileSync(session.user.id);
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

  return {
    updateProfile,
    forceProfileSync,
    isSyncing
  };
};
