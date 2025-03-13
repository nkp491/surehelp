
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useRoleCheck() {
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchUserRoles = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setUserRoles([]);
          setIsLoadingRoles(false);
          return;
        }

        // Fetch roles from user_roles table
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
          setUserRoles([]);
        } else {
          const roles = userRoles?.map(r => r.role) || [];
          setUserRoles(roles);
        }
        setIsLoadingRoles(false);
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
        setIsLoadingRoles(false);
      }
    };

    fetchUserRoles();

    // Set up a subscription to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        fetchUserRoles();
      } else {
        setUserRoles([]);
        setIsLoadingRoles(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  // Check if user has at least one of the required roles
  const hasRequiredRole = (requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (userRoles.length === 0) return false;
    
    // Check for system_admin first as it supersedes all other role checks
    if (userRoles.includes('system_admin')) return true;
    
    return userRoles.some(role => requiredRoles.includes(role));
  };

  // Get the highest tier role the user has
  const getHighestRole = () => {
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
  };

  // Check if user can be upgraded to a higher tier role
  const canUpgradeTo = (role: string) => {
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
  };

  return { 
    userRoles, 
    isLoadingRoles, 
    hasRequiredRole, 
    getHighestRole, 
    canUpgradeTo 
  };
}
