import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useToast } from "@/hooks/use-toast";
import { roleService } from "@/services/roleService";
import { validateFile } from "@/utils/fileValidation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
export const useProfileManagement = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        navigate("/auth");
        return null;
      }

      // Fetch profile data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();

      if (error) {
        console.error("Error fetching profile:", error);
        return null;
      }

      const { roles } = await roleService.fetchAndSaveRoles();

      return {
        ...profile,
        roles: roles,
        privacy_settings:
          typeof profile.privacy_settings === "string"
            ? JSON.parse(profile.privacy_settings)
            : profile.privacy_settings || {
                show_email: false,
                show_phone: false,
                show_photo: true,
              },
        notification_preferences:
          typeof profile.notification_preferences === "string"
            ? JSON.parse(profile.notification_preferences)
            : profile.notification_preferences || {
                email_notifications: true,
                phone_notifications: false,
              },
      } as Profile;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Auth state listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  async function updateProfile(updates: Partial<Profile>) {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        console.error("No active session found");
        navigate("/auth");
        return;
      }

      // Create a clean copy of updates for database
      const { roles, ...updatesToSave } = updates;

      // Handle JSON fields properly
      if (
        updatesToSave.privacy_settings &&
        typeof updatesToSave.privacy_settings !== "string"
      ) {
        (updatesToSave as Record<string, unknown>).privacy_settings =
          JSON.stringify(updatesToSave.privacy_settings);
      }

      if (
        updatesToSave.notification_preferences &&
        typeof updatesToSave.notification_preferences !== "string"
      ) {
        (updatesToSave as Record<string, unknown>).notification_preferences =
          JSON.stringify(updatesToSave.notification_preferences);
      }
      // FIX: Use .eq instead of .match for more reliable updating
      const { error } = await supabase
        .from("profiles")
        .update(updatesToSave as Record<string, unknown>)
        .eq("id", session.user.id)
        .select();
      if (error) {
        console.error("Error details:", error);
        throw error;
      }

      // If email is updated, update it in user_roles table as well
      if (updates.email) {
        const { error: rolesError } = await supabase
          .from("user_roles")
          .update({ email: updates.email })
          .eq("user_id", session.user.id);

        if (rolesError) {
          console.error("Error updating user_roles:", rolesError);
          throw rolesError;
        }
      }

      // Invalidate profile cache to refresh the data
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error updating profile",
        description:
          "There was a problem updating your profile. Please try again.",
        variant: "destructive",
      });
    }
  }

  async function uploadAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];

      // Validate file before upload
      const validation = validateFile(file, {
        maxSize: 5 * 1024 * 1024, // 5 MB limit
        allowedTypes: ["image/jpeg", "image/jpg", "image/png", "image/gif"],
        allowedExtensions: ["jpg", "jpeg", "png", "gif"],
      });

      if (!validation.isValid) {
        throw new Error(validation.error || "File validation failed");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("profile_images")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("profile_images").getPublicUrl(fileName);

      await updateProfile({ profile_image_url: publicUrl });

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
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
      roleService.clearRoles();
    }
  }

  return {
    profile: profileData,
    loading: isLoading,
    uploading,
    updateProfile,
    uploadAvatar,
    signOut,
  };
};
