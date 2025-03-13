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

      if (profileError) throw profileError;
      
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
      
      // Merge user metadata with profile data
      const mergedProfile = {
        ...profileData,
        roles: roles,
        privacy_settings: typeof profileData.privacy_settings === 'string' 
          ? JSON.parse(profileData.privacy_settings)
          : profileData.privacy_settings,
        notification_preferences: typeof profileData.notification_preferences === 'string'
          ? JSON.parse(profileData.notification_preferences)
          : profileData.notification_preferences
      } as Profile;
      
      // Override with user metadata if available
      if (user?.user_metadata) {
        console.log("User metadata from auth:", user.user_metadata);
        
        if (user.user_metadata.first_name) {
          mergedProfile.first_name = user.user_metadata.first_name;
        }
        
        if (user.user_metadata.last_name) {
          mergedProfile.last_name = user.user_metadata.last_name;
        }
        
        if (user.user_metadata.phone) {
          mergedProfile.phone = user.user_metadata.phone;
        }
        
        // Add any other fields from user metadata
        for (const [key, value] of Object.entries(user.user_metadata)) {
          if (key !== 'first_name' && key !== 'last_name' && key !== 'phone') {
            (mergedProfile as any)[key] = value;
          }
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
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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

      // Extract user metadata fields
      const userMetadata: any = {};
      let hasUpdates = false;
      
      // Add all fields to user metadata
      for (const [key, value] of Object.entries(updatesToSave)) {
        if (key !== 'email' && key !== 'id') {
          userMetadata[key] = value;
          hasUpdates = true;
        }
      }
      
      // Update user metadata
      if (hasUpdates) {
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
