
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

  // Role cache TTL - reduced for better responsiveness
  const CACHE_TTL = 3 * 60 * 1000; // 3 minutes (reduced from 5)

  // Using React Query for efficient caching of roles with optimized settings
  const { data: userRolesData = [], isLoading: isLoadingRoles, refetch } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      try {
        // Check session storage first for fastest access
        try {
          const sessionRoles = sessionStorage.getItem('user-roles');
          if (sessionRoles) {
            const roles = JSON.parse(sessionRoles);
            console.log("Using session storage roles:", roles);
            setIsInitialLoading(false);
            
            // Verify admin role
            if (Array.isArray(roles) && roles.includes('system_admin')) {
              localStorage.setItem('is-system-admin', 'true');
              localStorage.setItem('has-admin-access', 'true');
            }
            
            // Still fetch in background to update cache
            fetchUserRoles().then(freshRoles => {
              // Update session storage if roles have changed
              if (JSON.stringify(freshRoles) !== JSON.stringify(roles)) {
                sessionStorage.setItem('user-roles', JSON.stringify(freshRoles));
              }
            }).catch(error => {
              console.error("Background role refresh error:", error);
            });
            
            return roles;
          }
        } catch (e) {
          console.error('Error checking session storage:', e);
        }
        
        // Force clear any system admin flags when fetching fresh
        localStorage.removeItem('is-system-admin');
        const roles = await fetchUserRoles();
        setIsInitialLoading(false);
        
        // Cache the admin status immediately if detected
        if (Array.isArray(roles) && roles.includes('system_admin')) {
          console.log("System admin detected during fetch");
          localStorage.setItem('is-system-admin', 'true');
          localStorage.setItem('has-admin-access', 'true');
        }
        
        // Store in session storage for extremely fast future access
        try {
          sessionStorage.setItem('user-roles', JSON.stringify(roles));
        } catch (e) {
          console.error('Error saving to session storage:', e);
        }
        
        return roles;
      } catch (error) {
        console.error("Error fetching roles:", error);
        setIsInitialLoading(false);
        return [];
      }
    },
    staleTime: CACHE_TTL,
    refetchOnWindowFocus: false, // Changed to false to reduce unnecessary refetches
    refetchOnMount: true,
    retry: 1, // Reduced retries
    networkMode: 'always'
  });

  // Ensure userRoles is always an array
  const userRoles = Array.isArray(userRolesData) ? userRolesData : [];

  // Optimized system admin role check
  const hasSystemAdminRole = useMemo(() => {
    // Fast path: check session storage for fastest response
    try {
      const sessionRoles = sessionStorage.getItem('user-roles');
      if (sessionRoles) {
        const roles = JSON.parse(sessionRoles);
        if (Array.isArray(roles) && roles.includes('system_admin')) {
          return true;
        }
      }
    } catch (e) {
      console.error('Error checking session roles:', e);
    }
    
    // First check if we have it in the current roles array
    if (Array.isArray(userRoles) && userRoles.includes('system_admin')) {
      console.log("System admin found in current roles array");
      // Cache this for faster subsequent checks
      try {
        localStorage.setItem('is-system-admin', 'true');
        localStorage.setItem('has-admin-access', 'true');
        sessionStorage.setItem('is-admin', 'true');
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
      
      // Also check sessionStorage which is even faster
      const sessionAdminFlag = sessionStorage.getItem('is-admin');
      if (sessionAdminFlag === 'true') {
        console.log("System admin found in sessionStorage");
        return true;
      }
    } catch (e) {
      console.error('Error checking storage:', e);
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
        sessionStorage.setItem('is-admin', 'true');
      } catch (e) {
        console.error('Error setting admin flag:', e);
      }
    }
    
    return isAdmin;
  }, [userRoles, isLoadingRoles, isInitialLoading]);

  // Optimized role check function with caching
  const hasRequiredRole = useCallback((requiredRoles?: string[]) => {
    // If no roles required, grant access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    
    // Check for cached result in sessionStorage first
    try {
      const cacheKey = `role-check:${requiredRoles.sort().join(',')}`;
      const cachedResult = sessionStorage.getItem(cacheKey);
      if (cachedResult) {
        return cachedResult === 'true';
      }
    } catch (e) {
      console.error('Error checking cached role check:', e);
    }
    
    // If user is system admin, they have access to everything
    if (hasSystemAdminRole) {
      // Cache positive result
      try {
        const cacheKey = `role-check:${requiredRoles.sort().join(',')}`;
        sessionStorage.setItem(cacheKey, 'true');
      } catch (e) {
        console.error('Error caching role check:', e);
      }
      return true;
    }
    
    // Do full role check
    const result = checkRequiredRole(userRoles, requiredRoles);
    
    // Cache the result
    try {
      const cacheKey = `role-check:${requiredRoles.sort().join(',')}`;
      sessionStorage.setItem(cacheKey, result.toString());
    } catch (e) {
      console.error('Error caching role check:', e);
    }
    
    return result;
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
        
        // Clear session storage too
        try {
          sessionStorage.removeItem('user-roles');
          sessionStorage.removeItem('is-admin');
          
          // Clear all role check caches
          for (let i = 0; i < sessionStorage.length; i++) {
            const key = sessionStorage.key(i);
            if (key && key.startsWith('role-check:')) {
              sessionStorage.removeItem(key);
            }
          }
        } catch (e) {
          console.error('Error clearing session storage:', e);
        }
        
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
