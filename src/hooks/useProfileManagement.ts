
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

export const useProfileManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

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
      
      return {
        ...profileData,
        roles: roles,
        privacy_settings: typeof profileData.privacy_settings === 'string' 
          ? JSON.parse(profileData.privacy_settings)
          : profileData.privacy_settings,
        notification_preferences: typeof profileData.notification_preferences === 'string'
          ? JSON.parse(profileData.notification_preferences)
          : profileData.notification_preferences
      } as Profile;
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
      
      // Handle JSON fields properly
      if (updatesToSave.privacy_settings && typeof updatesToSave.privacy_settings !== 'string') {
        updatesToSave.privacy_settings = JSON.stringify(updatesToSave.privacy_settings);
      }
      
      if (updatesToSave.notification_preferences && typeof updatesToSave.notification_preferences !== 'string') {
        updatesToSave.notification_preferences = JSON.stringify(updatesToSave.notification_preferences);
      }

      // Log what we're sending to debug
      console.log("Updating profile with:", updatesToSave);

      // When updating the profile, avoid sending the query directly and use .match instead of .eq
      // This is to avoid the SQL error with user_role
      const { error } = await supabase
        .from("profiles")
        .update(updatesToSave)
        .match({ id: session.user.id });

      if (error) throw error;
      
      // If email is updated, update it in user_roles table as well
      if (updates.email) {
        const { error: rolesError } = await supabase
          .from("user_roles")
          .update({ email: updates.email })
          .eq("user_id", session.user.id);
          
        if (rolesError) throw rolesError;
      }
      
      // Refetch profile data to ensure we have the latest
      await refetch();
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description: "There was a problem updating your profile. Please try again.",
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
