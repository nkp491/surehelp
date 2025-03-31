
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export function RoleBasedRoute({ 
  children, 
  requiredRoles, 
  fallbackPath = "/metrics" 
}: RoleBasedRouteProps) {
  const { hasRequiredRole, isLoadingRoles, userRoles, refetchRoles } = useRoleCheck();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);
  
  useEffect(() => {
    // When component mounts, ensure we have the latest roles
    refetchRoles();
  }, [refetchRoles]);
  
  useEffect(() => {
    if (!isLoadingRoles) {
      console.log("Checking access with roles:", userRoles);
      console.log("Required roles:", requiredRoles);
      const access = hasRequiredRole(requiredRoles);
      console.log("Access granted:", access);
      setHasAccess(access);
      setIsCheckingAccess(false);
    }
  }, [isLoadingRoles, hasRequiredRole, requiredRoles, userRoles]);
  
  if (isLoadingRoles || isCheckingAccess) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You don't have the required permissions to access this page.
            {requiredRoles && requiredRoles.length > 0 && (
              <p className="mt-2">
                Required role(s): {requiredRoles.map(role => role.replace('_', ' ')).join(', ')}
              </p>
            )}
          </AlertDescription>
        </Alert>
        <div className="text-center mt-8">
          <Navigate to={fallbackPath} replace />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
