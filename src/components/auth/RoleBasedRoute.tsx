
import { ReactNode, useEffect, useState } from "react";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import LoadingSkeleton from "@/components/ui/loading-skeleton";

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles: string[];
  fallbackPath?: string;
}

export const RoleBasedRoute = ({
  children,
  requiredRoles,
  fallbackPath = "/metrics",
}: RoleBasedRouteProps) => {
  const { hasRequiredRole, isLoadingRoles, hasSystemAdminRole, userRoles, refetchRoles } = useRoleCheck();
  const navigate = useNavigate();
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  // Emergency timeout to prevent infinite loading - reduced to 500ms from 1000ms
  useEffect(() => {
    // Ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      if (isCheckingAccess) {
        console.log("RoleBasedRoute: Force ending access check due to timeout");
        setIsCheckingAccess(false);
        
        // If we have system admin in localStorage, grant access temporarily
        try {
          const hasAdminAccess = localStorage.getItem('is-system-admin') === 'true';
          if (hasAdminAccess) {
            console.log("Granting access based on localStorage admin flag");
            setAccessGranted(true);
            return;
          }
          
          // Check sessionStorage for cached role check
          const cachedResult = sessionStorage.getItem(`role-check:${requiredRoles.sort().join(',')}`);
          if (cachedResult) {
            const hasAccess = cachedResult === 'true';
            console.log(`Using cached role check: ${hasAccess}`);
            setAccessGranted(hasAccess);
            return;
          }
          
          // If still not sure, but we have roles, do a final check
          if (Array.isArray(userRoles) && userRoles.length > 0) {
            const hasAccess = hasRequiredRole(requiredRoles);
            setAccessGranted(hasAccess);
            // Cache the result in sessionStorage
            try {
              sessionStorage.setItem(`role-check:${requiredRoles.sort().join(',')}`, hasAccess.toString());
            } catch (e) {
              console.error('Error caching role check:', e);
            }
          }
        } catch (e) {
          console.error('Error checking localStorage:', e);
        }
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [isCheckingAccess, hasRequiredRole, requiredRoles, userRoles]);

  // Special check for admin routes
  useEffect(() => {
    // If we're checking an admin route and having issues, force refetch
    const isAdminRoute = requiredRoles.includes('system_admin');
    if (isAdminRoute && accessGranted === false && localStorage.getItem('is-system-admin') === 'true') {
      console.log("Mismatched admin status, force refetching roles");
      refetchRoles();
    }
  }, [accessGranted, requiredRoles, refetchRoles]);

  // Main access check logic - optimized for faster checks
  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsCheckingAccess(true);
        
        // First check for cached results in sessionStorage for extremely fast response
        try {
          const cachedResult = sessionStorage.getItem(`role-check:${requiredRoles.sort().join(',')}`);
          if (cachedResult) {
            const hasAccess = cachedResult === 'true';
            console.log(`Using cached role check: ${hasAccess}`);
            setAccessGranted(hasAccess);
            setIsCheckingAccess(false);
            
            // If no access, redirect
            if (!hasAccess) {
              navigate(fallbackPath, { replace: true });
            }
            return;
          }
        } catch (e) {
          console.error('Error checking sessionStorage:', e);
        }
        
        // Next check localStorage for quick admin check
        try {
          const isAdmin = localStorage.getItem('is-system-admin') === 'true';
          if (isAdmin) {
            console.log("Admin access granted from localStorage");
            setAccessGranted(true);
            setIsCheckingAccess(false);
            return;
          }
        } catch (e) {
          console.error('Error checking localStorage:', e);
        }
        
        // System admins always have access to all routes
        if (hasSystemAdminRole) {
          console.log("User is system_admin, granting access to protected route");
          setAccessGranted(true);
          setIsCheckingAccess(false);
          return;
        }
        
        if (!isLoadingRoles) {
          console.log(`Checking if user has required roles: ${requiredRoles.join(', ')}`);
          console.log(`User roles: ${userRoles?.join(', ') || 'none'}`);
          
          const hasAccess = hasRequiredRole(requiredRoles);
          
          console.log(`Access ${hasAccess ? 'granted' : 'denied'}`);
          setAccessGranted(hasAccess);
          
          // Cache the result in sessionStorage
          try {
            sessionStorage.setItem(`role-check:${requiredRoles.sort().join(',')}`, hasAccess.toString());
          } catch (e) {
            console.error('Error caching role check:', e);
          }
          
          if (!hasAccess) {
            toast.error(`Access denied: You don't have the required permissions.`);
            navigate(fallbackPath, { replace: true });
          }
          
          setIsCheckingAccess(false);
        }
      } catch (error) {
        console.error("Error checking role access:", error);
        setAccessGranted(false);
        setIsCheckingAccess(false);
        toast.error("Error checking permissions. Please try again later.");
        navigate(fallbackPath, { replace: true });
      }
    };

    checkAccess();
  }, [
    requiredRoles, 
    hasRequiredRole, 
    isLoadingRoles, 
    hasSystemAdminRole, 
    userRoles, 
    fallbackPath, 
    navigate
  ]);

  // Show loading skeleton only briefly while checking access
  // Using a more optimistic approach - show content sooner
  if (isCheckingAccess && isLoadingRoles && accessGranted === null) {
    return <LoadingSkeleton />;
  }

  // Return children when access is granted or still checking but we have roles
  return (accessGranted || (accessGranted === null && !isLoadingRoles)) ? <>{children}</> : null;
};
