
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
  const { hasRequiredRole, isLoadingRoles, hasSystemAdminRole, userRoles } = useRoleCheck();
  const navigate = useNavigate();
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);

  useEffect(() => {
    // Ensure we don't get stuck in loading state
    const timeoutId = setTimeout(() => {
      if (isCheckingAccess) {
        console.log("RoleBasedRoute: Force ending access check due to timeout");
        setIsCheckingAccess(false);
        
        // If we have system admin in localStorage, grant access temporarily
        try {
          const hasAdminAccess = localStorage.getItem('has-admin-access') === 'true';
          if (hasAdminAccess) {
            setAccessGranted(true);
          }
        } catch (e) {
          console.error('Error checking localStorage:', e);
        }
      }
    }, 1000);
    
    return () => clearTimeout(timeoutId);
  }, [isCheckingAccess]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        setIsCheckingAccess(true);
        
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

  // Show loading skeleton while checking access
  if (isCheckingAccess || (isLoadingRoles && accessGranted === null)) {
    return <LoadingSkeleton />;
  }

  // Return children when access is granted
  return accessGranted ? <>{children}</> : null;
};
