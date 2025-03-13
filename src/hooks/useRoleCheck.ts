
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

  // Role cache TTL increased for better performance
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes - reduced for more frequent checks

  // Using React Query for efficient caching of roles with longer stale time
  const { data: userRolesData = [], isLoading: isLoadingRoles, refetch } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const roles = await fetchUserRoles();
      setIsInitialLoading(false);
      return roles;
    },
    staleTime: CACHE_TTL, // Cache for 15 minutes
    refetchOnWindowFocus: true, // Refresh when window gets focus
    refetchOnMount: true,
    retry: 2
  });

  // Force a roles refresh on navigation
  useEffect(() => {
    const handleNavigation = () => {
      // Check if refetch is needed
      if (userRolesData.length === 0) {
        console.log('Navigation detected, refreshing roles if empty');
        refetch();
      }
    };
    
    window.addEventListener('popstate', handleNavigation);
    return () => window.removeEventListener('popstate', handleNavigation);
  }, [refetch, userRolesData]);

  // Ensure userRoles is always an array
  const userRoles = Array.isArray(userRolesData) ? userRolesData : [];

  // Check if user has system_admin role for quick access decisions
  const hasSystemAdminRole = useMemo(() => {
    if (!userRoles || !Array.isArray(userRoles) || userRoles.length === 0) {
      // Check if we have a local flag for system admin (for faster UI rendering)
      const localAdminFlag = localStorage.getItem('is-system-admin');
      return localAdminFlag === 'true';
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
        
        // Clear session storage too
        try {
          sessionStorage.removeItem('user-roles');
          localStorage.removeItem('is-system-admin');
        } catch (e) {
          console.error('Error clearing storage:', e);
        }
        
        // Force refetch roles
        refetch();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [refetch]);

  console.log('useRoleCheck returning:', { 
    userRoles, 
    isLoadingRoles: isLoadingRoles || isInitialLoading,
    hasSystemAdminRole
  });

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
