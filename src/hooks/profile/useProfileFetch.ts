
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Profile } from "@/types/profile";
import { useNavigate } from "react-router-dom";
import { useProfileSanitization } from "./useProfileSanitization";

export const useProfileFetch = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { sanitizeProfileData } = useProfileSanitization();

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
        throw profileError;
      }
      
      // Fetch user roles
      const { data: userRoles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
        
      if (rolesError) throw rolesError;
      
      const roles = userRoles.map(r => r.role);

      // Get user metadata from auth
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error fetching user metadata:", userError);
      }

      // Sanitize profile data to ensure it matches our Profile type
      return sanitizeProfileData({
        ...profileData,
        roles: roles,
      });
    },
    staleTime: 1000 * 60 * 5, // Consider data fresh for 5 minutes
    gcTime: 1000 * 60 * 30, // Keep data in cache for 30 minutes
  });

  return {
    profile,
    isLoading,
    refetch,
    invalidateProfile: () => queryClient.invalidateQueries({ queryKey: ['profile'] })
  };
};
