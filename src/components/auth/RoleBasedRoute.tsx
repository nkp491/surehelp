
import { ReactNode, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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
  const { hasRequiredRole, isLoadingRoles, userRoles } = useRoleCheck();
  const [isVerifying, setIsVerifying] = useState(true);
  const [serverVerified, setServerVerified] = useState(false);
  
  useEffect(() => {
    // Skip server verification if no roles are required
    if (!requiredRoles || requiredRoles.length === 0) {
      setIsVerifying(false);
      return;
    }
    
    // Client has all roles data loaded, perform verification
    if (!isLoadingRoles) {
      // If user has system_admin role, grant access immediately
      if (userRoles.includes('system_admin')) {
        setIsVerifying(false);
        return;
      }
      
      // Only perform server verification if client-side check fails
      if (hasRequiredRole(requiredRoles)) {
        setIsVerifying(false);
      } else {
        // Verify role with server for extra security
        const verifyWithServer = async () => {
          try {
            const { data, error } = await supabase.functions.invoke('verify-user-roles', {
              body: { requiredRoles }
            });
            
            if (error) {
              console.error('Error verifying roles:', error);
              setServerVerified(false);
            } else {
              setServerVerified(data.hasRequiredRole || false);
            }
            setIsVerifying(false);
          } catch (err) {
            console.error('Failed to verify roles with server:', err);
            setServerVerified(false);
            setIsVerifying(false);
          }
        };
        
        verifyWithServer();
      }
    }
  }, [isLoadingRoles, hasRequiredRole, requiredRoles, userRoles]);

  if (isLoadingRoles || isVerifying) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Access is granted when client-side check passes or server verification passed
  // For routes without required roles, we skip verification
  const hasAccess = (!requiredRoles || requiredRoles.length === 0) || 
                    hasRequiredRole(requiredRoles) || serverVerified;

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
