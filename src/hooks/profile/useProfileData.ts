
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useNavigate } from "react-router-dom";

/**
 * Hook to fetch and manage profile data
 */
export const useProfileData = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Profile query with React Query
  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return null;
      }

      // Fetch basic profile data
      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (profileError) {
        console.error("Error fetching profile data:", profileError);
        
        // If no profile found, create a basic one
        if (profileError.code === 'PGRST116') {
          return await createDefaultProfile();
        }
        
        throw profileError;
      }
      
      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role, email")
        .eq("user_id", session.user.id);
        
      if (rolesError) throw rolesError;
      
      const roles = userRoles.map(r => r.role);
      
      // Fetch user metadata from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user metadata:", userError);
      }
      
      // Sanitize profile data to ensure proper JSON field parsing
      const sanitizedProfileData = sanitizeProfileData(profileData);
      
      // Merge profile data with user metadata and roles
      const mergedProfile: Profile = {
        ...sanitizedProfileData,
        roles: roles,
      };
      
      // If there's user metadata available, sync it with the profile
      if (user?.user_metadata) {
        await syncMetadataWithProfile(user.user_metadata, profileData, session.user.id, mergedProfile);
      } else if (profileData.first_name || profileData.last_name || profileData.phone) {
        // Sync profile data to auth metadata if necessary
        await syncProfileWithMetadata(profileData);
      }
      
      return mergedProfile;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  // Helper function to create a default profile
  const createDefaultProfile = async () => {
    const { data: userData } = await supabase.auth.getUser();
    if (userData.user) {
      const defaultPrivacySettings = {
        show_email: false,
        show_phone: false,
        show_photo: true
      };
      
      const defaultNotificationPreferences = {
        email_notifications: true,
        phone_notifications: false
      };
      
      const newProfile = {
        id: userData.user.id,
        email: userData.user.email,
        first_name: userData.user.user_metadata.first_name || null,
        last_name: userData.user.user_metadata.last_name || null,
        phone: userData.user.user_metadata.phone || null,
        privacy_settings: defaultPrivacySettings,
        notification_preferences: defaultNotificationPreferences
      };
      
      const { data: insertedProfile, error: insertError } = await supabase
        .from("profiles")
        .insert(newProfile)
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      // Properly cast and sanitize the inserted profile data
      return sanitizeProfileData(insertedProfile) as Profile;
    }
    throw new Error("User not authenticated");
  };

  // Helper function to sanitize profile data
  const sanitizeProfileData = (profileData: any): Profile => {
    let sanitized = { ...profileData };
    
    // Sanitize privacy_settings to ensure it's the correct type
    if (typeof profileData.privacy_settings === 'string') {
      try {
        sanitized.privacy_settings = JSON.parse(profileData.privacy_settings);
      } catch (e) {
        sanitized.privacy_settings = {
          show_email: false,
          show_phone: false,
          show_photo: true
        };
      }
    } else if (!profileData.privacy_settings || Array.isArray(profileData.privacy_settings)) {
      sanitized.privacy_settings = {
        show_email: false,
        show_phone: false,
        show_photo: true
      };
    }
    
    // Sanitize notification_preferences to ensure it's the correct type
    if (typeof profileData.notification_preferences === 'string') {
      try {
        sanitized.notification_preferences = JSON.parse(profileData.notification_preferences);
      } catch (e) {
        sanitized.notification_preferences = {
          email_notifications: true,
          phone_notifications: false
        };
      }
    } else if (!profileData.notification_preferences || Array.isArray(profileData.notification_preferences)) {
      sanitized.notification_preferences = {
        email_notifications: true,
        phone_notifications: false
      };
    }
    
    return sanitized as Profile;
  };

  // Helper function to sync auth metadata to profile
  const syncMetadataWithProfile = async (
    userMetadata: any, 
    profileData: any, 
    userId: string,
    mergedProfile: Profile
  ) => {
    const syncNeeded = (
      (userMetadata.first_name && userMetadata.first_name !== profileData.first_name) ||
      (userMetadata.last_name && userMetadata.last_name !== profileData.last_name) || 
      (userMetadata.phone && userMetadata.phone !== profileData.phone)
    );
    
    // Sync auth metadata to profile table if necessary
    if (syncNeeded) {
      const updates: any = {};
      
      if (userMetadata.first_name && userMetadata.first_name !== profileData.first_name) {
        updates.first_name = userMetadata.first_name;
        mergedProfile.first_name = userMetadata.first_name;
      }
      
      if (userMetadata.last_name && userMetadata.last_name !== profileData.last_name) {
        updates.last_name = userMetadata.last_name;
        mergedProfile.last_name = userMetadata.last_name;
      }
      
      if (userMetadata.phone && userMetadata.phone !== profileData.phone) {
        updates.phone = userMetadata.phone;
        mergedProfile.phone = userMetadata.phone;
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

  // Helper function to sync profile data to auth metadata
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
    profile,
    isLoading,
    refetch,
    invalidateProfile: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  };
};
