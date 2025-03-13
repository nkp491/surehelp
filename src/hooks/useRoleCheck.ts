
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useRoleCheck() {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRoles([]);
          setIsLoadingRoles(false);
          return;
        }

        const { data: userRoles } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        const roles = userRoles?.map(r => r.role) || [];
        setUserRoles(roles);
        setIsLoadingRoles(false);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
        setIsLoadingRoles(false);
      }
    };

    fetchUserRoles();
  }, []);

  // Check if user has at least one of the required roles
  const hasRequiredRole = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (userRoles.length === 0) return false;
    
    return userRoles.some(role => requiredRoles.includes(role));
  };

  return { userRoles, isLoadingRoles, hasRequiredRole };
}
