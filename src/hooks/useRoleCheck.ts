
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  getRolesFromStorage, 
  setRolesInCache, 
  invalidateRolesCache,
  getRolesFromCache
} from "@/lib/auth-cache";

export function useRoleCheck() {
  const { toast } = useToast();
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Using React Query for efficient caching of roles
  const { data: userRolesData = [], isLoading: isLoadingRoles } = useQuery({
    queryKey: ["user-roles"],
    queryFn: async () => {
      const cachedRoles = getRolesFromCache();
      if (cachedRoles.length > 0) return cachedRoles;

      const storageRoles = getRolesFromStorage();
      if (storageRoles.length > 0) {
        setRolesInCache(storageRoles);
        return storageRoles;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const { data: userRoles, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
          
        if (error) {
          console.error('Error fetching user roles:', error);
          toast({
            title: "Error",
            description: "Failed to fetch user roles. Some features may be unavailable.",
            variant: "destructive",
          });
          return [];
        } else {
          const roles = userRoles?.map(r => r.role) || [];
          console.log('Fetched user roles:', roles);
          
          // Store the roles in cache
          setRolesInCache(roles);
          return roles;
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        return [];
      } finally {
        setIsInitialLoading(false);
      }
    },
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: true
  });

  // Ensure userRoles is always an array
  const userRoles = Array.isArray(userRolesData) ? userRolesData : [];

  // Check if user has at least one of the required roles - with fast client-side check
  const hasRequiredRole = useCallback((requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (userRoles.length === 0) return false;
    
    // Check for system_admin first as it supersedes all other role checks
    if (userRoles.includes('system_admin')) {
      console.log('User is system_admin, access granted');
      return true;
    }
    
    // Check if user has any of the required roles
    const hasRole = userRoles.some(role => requiredRoles.includes(role));
    console.log('Role check result:', { userRoles, requiredRoles, hasRole });
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
    
    userRoles.forEach(role => {
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
        invalidateRolesCache();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return { 
    userRoles, 
    isLoadingRoles: isLoadingRoles || isInitialLoading, 
    hasRequiredRole, 
    getHighestRole, 
    canUpgradeTo 
  };
}
