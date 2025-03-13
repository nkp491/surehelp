
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
  const { hasRequiredRole, isLoadingRoles } = useRoleCheck();
  const [serverVerified, setServerVerified] = useState<boolean | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  
  useEffect(() => {
    // Skip server verification if no roles are required
    if (!requiredRoles || requiredRoles.length === 0) {
      setServerVerified(true);
      setIsVerifying(false);
      return;
    }
    
    // Client has all roles data loaded, perform server verification
    if (!isLoadingRoles) {
      const verifyRolesOnServer = async () => {
        try {
          // Only perform server verification if client-side check passes
          if (hasRequiredRole(requiredRoles)) {
            const { data, error } = await supabase.rpc(
              'verify_user_roles',
              { required_roles: requiredRoles }
            );
            
            if (error) {
              console.error("Server role verification error:", error);
              setServerVerified(false);
            } else {
              setServerVerified(!!data);
            }
          } else {
            // Client-side check failed, no need for server verification
            setServerVerified(false);
          }
        } catch (err) {
          console.error("Role verification error:", err);
          setServerVerified(false);
        } finally {
          setIsVerifying(false);
        }
      };
      
      verifyRolesOnServer();
    }
  }, [isLoadingRoles, hasRequiredRole, requiredRoles]);

  if (isLoadingRoles || isVerifying) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  // Access is granted only when both client-side and server-side checks pass
  // For routes without required roles, we skip server verification
  const hasAccess = (!requiredRoles || requiredRoles.length === 0) || 
                    (hasRequiredRole(requiredRoles) && serverVerified === true);

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
