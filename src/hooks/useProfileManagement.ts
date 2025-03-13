
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const useProfileManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
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
          const { data: userData } = await supabase.auth.getUser();
          if (userData.user) {
            const newProfile = {
              id: userData.user.id,
              email: userData.user.email,
              first_name: userData.user.user_metadata.first_name || null,
              last_name: userData.user.user_metadata.last_name || null,
              phone: userData.user.user_metadata.phone || null,
              privacy_settings: {
                show_email: false,
                show_phone: false,
                show_photo: true
              },
              notification_preferences: {
                email_notifications: true,
                phone_notifications: false
              }
            };
            
            const { data: insertedProfile, error: insertError } = await supabase
              .from("profiles")
              .insert(newProfile)
              .select()
              .single();
              
            if (insertError) throw insertError;
            return insertedProfile as Profile;
          }
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
      
      // Prepare the profile data, ensuring JSON fields are properly parsed
      let sanitizedProfileData = { ...profileData };
      if (typeof profileData.privacy_settings === 'string') {
        try {
          sanitizedProfileData.privacy_settings = JSON.parse(profileData.privacy_settings);
        } catch (e) {
          sanitizedProfileData.privacy_settings = {
            show_email: false,
            show_phone: false,
            show_photo: true
          };
        }
      }
      
      if (typeof profileData.notification_preferences === 'string') {
        try {
          sanitizedProfileData.notification_preferences = JSON.parse(profileData.notification_preferences);
        } catch (e) {
          sanitizedProfileData.notification_preferences = {
            email_notifications: true,
            phone_notifications: false
          };
        }
      }
      
      // Merge profile data with user metadata
      const mergedProfile = {
        ...sanitizedProfileData,
        roles: roles,
      } as Profile;
      
      // If there's user metadata available, sync it with the profile
      if (user?.user_metadata) {
        const syncNeeded = (
          (user.user_metadata.first_name && user.user_metadata.first_name !== profileData.first_name) ||
          (user.user_metadata.last_name && user.user_metadata.last_name !== profileData.last_name) || 
          (user.user_metadata.phone && user.user_metadata.phone !== profileData.phone)
        );
        
        // Sync auth metadata to profile table if necessary
        if (syncNeeded) {
          const updates: any = {};
          
          if (user.user_metadata.first_name && user.user_metadata.first_name !== profileData.first_name) {
            updates.first_name = user.user_metadata.first_name;
            mergedProfile.first_name = user.user_metadata.first_name;
          }
          
          if (user.user_metadata.last_name && user.user_metadata.last_name !== profileData.last_name) {
            updates.last_name = user.user_metadata.last_name;
            mergedProfile.last_name = user.user_metadata.last_name;
          }
          
          if (user.user_metadata.phone && user.user_metadata.phone !== profileData.phone) {
            updates.phone = user.user_metadata.phone;
            mergedProfile.phone = user.user_metadata.phone;
          }
          
          if (Object.keys(updates).length > 0) {
            console.log("Syncing auth metadata to profile:", updates);
            await supabase
              .from("profiles")
              .update(updates)
              .eq("id", session.user.id);
          }
        }
      } else if (profileData.first_name || profileData.last_name || profileData.phone) {
        // Sync profile data to auth metadata if necessary
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
      }
      
      return mergedProfile;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (event === "USER_UPDATED") {
        // Refresh profile data when user is updated
        refetch();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, refetch]);

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
              // Don't throw here, just log the error
            }
          } catch (rolesUpdateError) {
            console.error("Error updating user_roles:", rolesUpdateError);
            // Don't throw here, just log the error
          }
        }
      }
      
      // Update profile in database
      const { error: profileError } = await supabase
        .from("profiles")
        .update(updatesToSave)
        .eq("id", session.user.id);
        
      if (profileError) {
        console.error("Error updating profile in database:", profileError);
        throw profileError;
      }
      
      // Invalidate the profile query to force a refetch
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      
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

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(fileName);

      await updateProfile({ profile_image_url: publicUrl });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  }

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  }

  return {
    profile,
    loading: isLoading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut
  };
};
