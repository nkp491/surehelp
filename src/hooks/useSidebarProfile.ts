
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useSidebarProfile() {
  const [profileData, setProfileData] = useState<{
    first_name?: string | null;
    profile_image_url?: string | null;
    roles?: string[];
  }>({});

  const fetchProfileData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, profile_image_url')
          .eq('id', user.id)
          .single();
          
        // Fetch user roles
        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        const roles = userRoles?.map(r => r.role) || [];

        if (profile) {
          setProfileData({
            ...profile,
            roles: roles
          });
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    fetchProfileData();

    const channel = supabase
      .channel('profile_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles'
        },
        (payload) => {
          setProfileData(payload.new as any);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const hasRequiredRole = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!profileData.roles || profileData.roles.length === 0) return false;
    
    return profileData.roles.some(role => requiredRoles.includes(role));
  };

  return {
    profileData,
    hasRequiredRole
  };
}
