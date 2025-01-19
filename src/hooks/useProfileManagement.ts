import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";

export const useProfileManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getProfile();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function getProfile() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) throw error;
      
      const parsedProfile: Profile = {
        ...data,
        privacy_settings: typeof data.privacy_settings === 'string' 
          ? JSON.parse(data.privacy_settings)
          : data.privacy_settings,
        notification_preferences: typeof data.notification_preferences === 'string'
          ? JSON.parse(data.notification_preferences)
          : data.notification_preferences
      };
      
      setProfile(parsedProfile);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error loading profile",
        description: "There was a problem loading your profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateProfile(updates: Partial<Profile>) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", session.user.id);

      if (error) throw error;
      
      setProfile(prev => prev ? { ...prev, ...updates } : null);
      
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

      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('profile_images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile_images')
        .getPublicUrl(fileName);

      // Update profile with new image URL
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
    loading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut
  };
};