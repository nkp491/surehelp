
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { 
  getRolesFromStorage, 
  setRolesInCache, 
  invalidateRolesCache,
  getRolesFromCache
} from "@/lib/auth-cache";

export function useRoleCheck() {
  const { toast: uiToast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Role cache TTL increased for better performance
  const CACHE_TTL = 15 * 60 * 1000; // 15 minutes - reduced for more frequent checks

  // Check if we have roles in session storage first (fastest)
  const cachedSessionRoles = useMemo(() => {
    try {
      const sessionRoles = sessionStorage.getItem('user-roles');
      if (sessionRoles) {
        console.log('Using cached roles from session storage');
        return JSON.parse(sessionRoles);
      }
    } catch (e) {
      console.error('Error reading session roles:', e);
    }
    return null;
  }, []);

  // Using React Query for efficient caching of roles with longer stale time
  const { data: userRolesData = [], isLoading: isLoadingRoles, refetch } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      console.log('Fetching user roles...');
      
      // Use session storage for fastest access if available
      if (cachedSessionRoles) {
        console.log('Using session storage roles:', cachedSessionRoles);
        return cachedSessionRoles;
      }
      
      // Then try cached roles
      const cachedRoles = getRolesFromCache();
      if (Array.isArray(cachedRoles) && cachedRoles.length > 0) {
        console.log('Using cached roles:', cachedRoles);
        // Update session storage for next time
        try {
          sessionStorage.setItem('user-roles', JSON.stringify(cachedRoles));
        } catch (e) {
          console.error('Error saving to session storage:', e);
        }
        return cachedRoles;
      }

      // Then try local storage
      const storageRoles = getRolesFromStorage();
      if (Array.isArray(storageRoles) && storageRoles.length > 0) {
        console.log('Using roles from storage:', storageRoles);
        setRolesInCache(storageRoles);
        // Update session storage
        try {
          sessionStorage.setItem('user-roles', JSON.stringify(storageRoles));
        } catch (e) {
          console.error('Error saving to session storage:', e);
        }
        return storageRoles;
      }

      // Finally, fetch from database
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No authenticated user found, returning empty roles array');
          return [];
        }

        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching user roles:', error);
          toast.error("Error loading user permissions");
          return [];
        } else {
          const roles = userRoles?.map(r => r.role) || [];
          console.log('Fetched user roles from database:', roles);
          
          // Store the roles in all caches
          setRolesInCache(roles);
          try {
            sessionStorage.setItem('user-roles', JSON.stringify(roles));
            // Also store in localStorage as fallback
            localStorage.setItem('user-roles-backup', JSON.stringify(roles));
          } catch (e) {
            console.error('Error saving to storage:', e);
          }
          return roles;
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        toast.error("Failed to load permissions");
        
        // Try fallback from localStorage 
        try {
          const backupRoles = localStorage.getItem('user-roles-backup');
          if (backupRoles) {
            console.log('Using backup roles from localStorage');
            return JSON.parse(backupRoles);
          }
        } catch (e) {
          console.error('Error reading backup roles:', e);
        }
        
        return [];
      } finally {
        setIsInitialLoading(false);
      }
    },
    staleTime: CACHE_TTL, // Cache for 15 minutes
    refetchOnWindowFocus: true, // Refresh when window gets focus
    refetchOnMount: true,
    initialData: cachedSessionRoles || [],
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
    const isAdmin = userRoles.includes('system_admin');
    
    // Cache the admin status for faster subsequent checks
    if (isAdmin) {
      localStorage.setItem('is-system-admin', 'true');
    }
    
    return isAdmin;
  }, [userRoles]);

  // Memoize role check function to avoid unnecessary recalculations
  const hasRequiredRole = useCallback((requiredRoles?: string[]) => {
    // Log role check to help with debugging
    console.log('Checking roles:', { userRoles, requiredRoles });
    
    if (!requiredRoles || requiredRoles.length === 0) return true;
    
    // Ensure userRoles is an array
    const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
    
    // Special case: check system_admin first as it supersedes all other roles
    if (userRolesArray.includes('system_admin')) {
      console.log('User has system_admin role, granting access');
      return true;
    }
    
    // Special case: empty user roles array
    if (userRolesArray.length === 0) {
      console.log('User has no roles, denying access');
      return false;
    }
    
    // Check if user has any of the required roles
    const hasRole = userRolesArray.some(role => requiredRoles.includes(role));
    console.log('Role check result:', hasRole);
    return hasRole;
  }, [userRoles]);

  // Get the highest tier role the user has
  const getHighestRole = useCallback(() => {
    const roleHierarchy = [
      'agent',
      'agent_pro',
      'manager_pro',
      'manager_pro_gold',
      'manager_pro_platinum',
      'beta_user',
      'system_admin'
    ];
    
    let highestRoleIndex = -1;
    
    // Ensure userRoles is an array
    const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
    
    userRolesArray.forEach(role => {
      const index = roleHierarchy.indexOf(role);
      if (index > highestRoleIndex) {
        highestRoleIndex = index;
      }
    });
    
    return highestRoleIndex >= 0 ? roleHierarchy[highestRoleIndex] : null;
  }, [userRoles]);

  // Check if user can be upgraded to a higher tier role
  const canUpgradeTo = useCallback((role: string) => {
    const roleHierarchy = [
      'agent',
      'agent_pro',
      'manager_pro',
      'manager_pro_gold',
      'manager_pro_platinum'
    ];
    
    const currentRoleIndex = roleHierarchy.indexOf(getHighestRole() || '');
    const targetRoleIndex = roleHierarchy.indexOf(role);
    
    return currentRoleIndex < targetRoleIndex;
  }, [getHighestRole]);

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
