
import { useState, useEffect, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { invalidateRolesCache } from "@/lib/role-cache";
import { fetchUserRoles } from "@/lib/fetch-roles";
import { 
  checkRequiredRole, 
  checkSystemAdminRole, 
  getHighestRole as getHighestRoleUtil, 
  canUpgradeTo as canUpgradeToUtil 
} from "@/lib/role-utils";

export function useRoleCheck() {
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Role cache TTL
  const CACHE_TTL = 10 * 60 * 1000; // 10 minutes

  // Using React Query for efficient caching of roles
  const { data: userRolesData = [], isLoading: isLoadingRoles, refetch } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      try {
        const roles = await fetchUserRoles();
        setIsInitialLoading(false);
        return roles;
      } catch (error) {
        console.error("Error fetching roles:", error);
        setIsInitialLoading(false);
        return [];
      }
    },
    staleTime: CACHE_TTL,
    refetchOnWindowFocus: false, // Don't refresh on window focus to prevent flashing
    refetchOnMount: true,
    retry: 1,
    networkMode: 'always'
  });

  // Ensure userRoles is always an array
  const userRoles = Array.isArray(userRolesData) ? userRolesData : [];

  // Check if user has system_admin role for quick access decisions
  const hasSystemAdminRole = useMemo(() => {
    // Check if we have a local flag for system admin (for faster UI rendering)
    const localAdminFlag = localStorage.getItem('is-system-admin');
    if (localAdminFlag === 'true') {
      return true;
    }
    
    if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) {
      return false;
    }
    
    const isAdmin = checkSystemAdminRole(userRoles);
    
    // Cache the admin status for faster subsequent checks
    if (isAdmin) {
      localStorage.setItem('is-system-admin', 'true');
    }
    
    return isAdmin;
  }, [userRoles]);

  // Memoize role check function to avoid unnecessary recalculations
  const hasRequiredRole = useCallback((requiredRoles?: string[]) => {
    return checkRequiredRole(userRoles, requiredRoles);
  }, [userRoles]);

  // Get the highest tier role the user has
  const getHighestRole = useCallback(() => {
    return getHighestRoleUtil(userRoles);
  }, [userRoles]);

  // Check if user can be upgraded to a higher tier role
  const canUpgradeTo = useCallback((role: string) => {
    return canUpgradeToUtil(userRoles, role);
  }, [userRoles]);

  // Handle auth state changes to refresh roles
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Invalidate roles cache on auth state change
        console.log('Auth state change:', { event });
        invalidateRolesCache();
        
        // Force refetch roles
        refetch();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  return { 
    userRoles, 
    isLoadingRoles: isLoadingRoles || isInitialLoading, 
    hasRequiredRole, 
    hasSystemAdminRole,
    getHighestRole,
    canUpgradeTo,
    refetchRoles: refetch
  };
}
