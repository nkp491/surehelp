
import { supabase } from "@/integrations/supabase/client";

export const useProfileSync = () => {
  const syncMetadataWithProfile = async (
    userMetadata: any,
    profileData: any,
    userId: string
  ) => {
    const syncNeeded = (
      (userMetadata.first_name && userMetadata.first_name !== profileData.first_name) ||
      (userMetadata.last_name && userMetadata.last_name !== profileData.last_name) ||
      (userMetadata.phone && userMetadata.phone !== profileData.phone)
    );
    
    if (syncNeeded) {
      const updates: any = {};
      
      if (userMetadata.first_name && userMetadata.first_name !== profileData.first_name) {
        updates.first_name = userMetadata.first_name;
      }
      
      if (userMetadata.last_name && userMetadata.last_name !== profileData.last_name) {
        updates.last_name = userMetadata.last_name;
      }
      
      if (userMetadata.phone && userMetadata.phone !== profileData.phone) {
        updates.phone = userMetadata.phone;
      }
      
      if (Object.keys(updates).length > 0) {
        console.log("Syncing auth metadata to profile:", updates);
        await supabase
          .from("profiles")
          .update(updates)
          .eq("id", userId);
      }
    }
  };

  const syncProfileWithMetadata = async (profileData: any) => {
    const metadataUpdates: any = {};
    
    if (profileData.first_name) metadataUpdates.first_name = profileData.first_name;
    if (profileData.last_name) metadataUpdates.last_name = profileData.last_name;
    if (profileData.phone) metadataUpdates.phone = profileData.phone;
    
    if (Object.keys(metadataUpdates).length > 0) {
      console.log("Syncing profile data to auth metadata:", metadataUpdates);
      await supabase.auth.updateUser({
        data: metadataUpdates
      });
    }
  };

  return {
    syncMetadataWithProfile,
    syncProfileWithMetadata
  };
};
