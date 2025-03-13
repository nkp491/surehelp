
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
    const checkAccess = async () => {
      try {
        setIsCheckingAccess(true);
        
        // System admins always have access to all routes
        if (hasSystemAdminRole) {
          console.log("User is system_admin, granting access to protected route");
          setAccessGranted(true);
          localStorage.setItem('has-admin-access', 'true');
          setIsCheckingAccess(false);
          return;
        }
        
        if (!isLoadingRoles) {
          console.log(`Checking if user has required roles: ${requiredRoles.join(', ')}`);
          console.log(`User roles: ${userRoles?.join(', ') || 'none'}`);
          
          const hasAccess = hasRequiredRole(requiredRoles);
          
          console.log(`Access ${hasAccess ? 'granted' : 'denied'}`);
          setAccessGranted(hasAccess);
          
          // If this is an admin path, store the result for faster loading next time
          const isAdminPath = window.location.pathname.includes('admin') || 
                            window.location.pathname.includes('role-management');
          if (isAdminPath) {
            localStorage.setItem('has-admin-access', hasAccess ? 'true' : 'false');
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

  // Show loading skeleton while checking access
  if (isCheckingAccess || (isLoadingRoles && accessGranted === null)) {
    return <LoadingSkeleton />;
  }

  // Return children when access is granted
  return accessGranted ? <>{children}</> : null;
};
