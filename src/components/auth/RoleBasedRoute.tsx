
import { ReactNode, useEffect, useState } from "react";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

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
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);

  useEffect(() => {
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (accessGranted === null) {
        console.log("RoleBasedRoute: Force completion after timeout");
        setTimeoutOccurred(true);
        
        // If we're still loading after timeout, grant access conditionally
        // This helps prevent blank pages due to role checking failures
        if (isLoadingRoles) {
          // For safety, grant access if pathname includes a known admin path
          const isAdminPath = window.location.pathname.includes('admin') || 
                            window.location.pathname.includes('role-management');
          
          if (isAdminPath && localStorage.getItem('has-admin-access') === 'true') {
            console.log("Admin path detected with previous access, granting temporary access");
            setAccessGranted(true);
          }
        }
      }
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [accessGranted, isLoadingRoles]);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // System admins always have access to all routes
        if (hasSystemAdminRole) {
          console.log("User is system_admin, granting access to protected route");
          setAccessGranted(true);
          localStorage.setItem('has-admin-access', 'true');
          return;
        }
        
        // If we have roles loaded, check if the user has the required roles
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
        }
      } catch (error) {
        console.error("Error checking role access:", error);
        setAccessGranted(false);
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

  // Show children while loading to prevent flash of empty content
  if (isLoadingRoles && !timeoutOccurred) {
    return <div className="p-4">Verifying access...</div>;
  }

  // Either access is granted or we're in a timeout situation where we show content
  return (accessGranted || (timeoutOccurred && isLoadingRoles)) ? (
    <>{children}</>
  ) : null;
};
