
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useNavigate } from "react-router-dom";

/**
 * Hook to fetch and transform profile data
 */
export const useProfileData = () => {
  const navigate = useNavigate();

  return useQuery({
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
      
      // Transform the data to match our Profile type
      // Explicitly cast the profileData to any to avoid TypeScript errors
      const profile = profileData as any;
      
      // Transform the data to match our Profile type
      const transformedProfile = {
        ...profile,
        roles: roles,
        privacy_settings: typeof profile.privacy_settings === 'string' 
          ? JSON.parse(profile.privacy_settings)
          : profile.privacy_settings || { show_email: false, show_phone: false, show_photo: true },
        notification_preferences: typeof profile.notification_preferences === 'string'
          ? JSON.parse(profile.notification_preferences)
          : profile.notification_preferences || { email_notifications: true, phone_notifications: false },
        // Make sure agent_info is always defined in our profile object
        agent_info: profile.agent_info || null
      } as Profile;

      console.log("Fetched profile data:", transformedProfile);

      // Handle agent_info transformation if it exists
      if (transformedProfile.agent_info) {
        // Make sure arrays are properly handled
        if (transformedProfile.agent_info.line_authority) {
          if (typeof transformedProfile.agent_info.line_authority === 'string') {
            transformedProfile.agent_info.line_authority = [transformedProfile.agent_info.line_authority];
          }
        } else {
          transformedProfile.agent_info.line_authority = [];
        }
        
        if (transformedProfile.agent_info.active_state_licenses) {
          if (typeof transformedProfile.agent_info.active_state_licenses === 'string') {
            transformedProfile.agent_info.active_state_licenses = [transformedProfile.agent_info.active_state_licenses];
          }
        } else {
          transformedProfile.agent_info.active_state_licenses = [];
        }
      }
      
      return transformedProfile;
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });
};
