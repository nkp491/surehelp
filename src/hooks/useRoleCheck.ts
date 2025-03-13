
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
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutes (reduced from 10)

  // Using React Query for efficient caching of roles
  const { data: userRolesData = [], isLoading: isLoadingRoles, refetch } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      try {
        // Force clear any system admin flags when fetching
        localStorage.removeItem('is-system-admin');
        const roles = await fetchUserRoles();
        setIsInitialLoading(false);
        
        // Cache the admin status immediately if detected
        if (Array.isArray(roles) && roles.includes('system_admin')) {
          console.log("System admin detected during fetch");
          localStorage.setItem('is-system-admin', 'true');
          localStorage.setItem('has-admin-access', 'true');
        }
        
        return roles;
      } catch (error) {
        console.error("Error fetching roles:", error);
        setIsInitialLoading(false);
        return [];
      }
    },
    staleTime: CACHE_TTL,
    refetchOnWindowFocus: true, // Enable refetch on window focus
    refetchOnMount: true,
    retry: 2, // Increase retries
    networkMode: 'always'
  });

  // Ensure userRoles is always an array
  const userRoles = Array.isArray(userRolesData) ? userRolesData : [];

  // Check if user has system_admin role for quick access decisions
  const hasSystemAdminRole = useMemo(() => {
    console.log("Checking system admin status with roles:", userRoles);
    
    // First check if we have it in the current roles array
    if (Array.isArray(userRoles) && userRoles.includes('system_admin')) {
      console.log("System admin found in current roles array");
      // Cache this for faster subsequent checks
      try {
        localStorage.setItem('is-system-admin', 'true');
        localStorage.setItem('has-admin-access', 'true');
      } catch (e) {
        console.error('Error setting admin flag:', e);
      }
      return true;
    }
    
    // Then check if we have a local flag for system admin (for faster UI rendering)
    try {
      const localAdminFlag = localStorage.getItem('is-system-admin');
      if (localAdminFlag === 'true') {
        console.log("System admin found in localStorage");
        return true;
      }
    } catch (e) {
      console.error('Error checking localStorage:', e);
    }
    
    // If roles are still loading and we're not sure, use a fallback check
    if (isLoadingRoles && isInitialLoading) {
      try {
        // Use backup admin access as fallback during loading
        const hasBackupAdminAccess = localStorage.getItem('has-admin-access') === 'true';
        if (hasBackupAdminAccess) {
          console.log("Using backup admin access during loading");
          return true;
        }
      } catch (e) {
        console.error('Error checking backup admin access:', e);
      }
    }
    
    // Do a full check on the roles we have
    const isAdmin = checkSystemAdminRole(userRoles);
    
    // Cache the admin status if positive
    if (isAdmin) {
      try {
        localStorage.setItem('is-system-admin', 'true');
        localStorage.setItem('has-admin-access', 'true');
      } catch (e) {
        console.error('Error setting admin flag:', e);
      }
    }
    
    return isAdmin;
  }, [userRoles, isLoadingRoles, isInitialLoading]);

  // Memoize role check function to avoid unnecessary recalculations
  const hasRequiredRole = useCallback((requiredRoles?: string[]) => {
    // If user is system admin, they have access to everything
    if (hasSystemAdminRole) {
      return true;
    }
    
    return checkRequiredRole(userRoles, requiredRoles);
  }, [userRoles, hasSystemAdminRole]);

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
