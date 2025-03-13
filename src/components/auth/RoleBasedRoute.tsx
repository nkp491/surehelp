
import { ReactNode, useEffect, useState, useCallback } from "react";
import { Navigate } from "react-router-dom";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  cacheVerificationResult, 
  getVerificationFromCache
} from "@/lib/auth-cache";

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
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverVerified, setServerVerified] = useState(false);
  const [finalAccess, setFinalAccess] = useState<boolean | null>(null);
  const [loadTimeout, setLoadTimeout] = useState(false);
  
  // Add a safety timeout to prevent infinite loading
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isVerifying || finalAccess === null) {
        console.log('RoleBasedRoute: Force completion after timeout');
        setLoadTimeout(true);
        
        // Use client-side role check as fallback
        if (finalAccess === null) {
          const clientCheck = hasRequiredRole(requiredRoles);
          console.log('Using client-side check as fallback:', clientCheck);
          setFinalAccess(clientCheck);
        }
      }
    }, 3000); // 3 second safety timeout
    
    return () => clearTimeout(timer);
  }, [isVerifying, finalAccess, hasRequiredRole, requiredRoles]);
  
  // Optimize verification process with caching and early returns
  const verifyAccess = useCallback(async () => {
    console.log('Verifying access for roles:', requiredRoles);
    
    // Skip verification if no roles are required
    if (!requiredRoles || requiredRoles.length === 0) {
      console.log('No roles required, granting access');
      setFinalAccess(true);
      return;
    }
    
    // Fast path: System admin always gets access
    const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
    if (userRolesArray.includes('system_admin')) {
      console.log('User is system_admin, access granted immediately');
      setFinalAccess(true);
      return;
    }

    // Fast path: Client-side verification passes
    const clientVerified = hasRequiredRole(requiredRoles);
    console.log('Client-side role verification result:', clientVerified);
    if (clientVerified) {
      setFinalAccess(true);
      return;
    }
    
    // Check cache for previous server verification result
    const cachedVerification = getVerificationFromCache(requiredRoles);
    if (cachedVerification !== undefined) {
      console.log('Using cached verification result:', cachedVerification);
      setServerVerified(cachedVerification);
      setFinalAccess(cachedVerification);
      return;
    }
    
    // Only if client verification fails and no cache exists, verify with server
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-user-roles', {
        body: { requiredRoles }
      });
      
      if (error) {
        console.error('Error verifying roles:', error);
        setServerVerified(false);
        setFinalAccess(false);
      } else {
        const hasAccess = data?.hasRequiredRole || false;
        console.log('Server verification result:', hasAccess);
        setServerVerified(hasAccess);
        setFinalAccess(hasAccess);
        // Cache the server verification result
        cacheVerificationResult(requiredRoles, hasAccess);
      }
    } catch (err) {
      console.error('Failed to verify roles with server:', err);
      setServerVerified(false);
      setFinalAccess(false);
    } finally {
      setIsVerifying(false);
    }
  }, [hasRequiredRole, requiredRoles, userRoles]);

  // Trigger verification process when dependencies change
  useEffect(() => {
    console.log('RoleBasedRoute: Checking roles', { 
      isLoadingRoles, 
      userRoles, 
      requiredRoles, 
      finalAccess 
    });
    
    // Skip if still loading roles
    if (isLoadingRoles) {
      console.log('Still loading roles, waiting...');
      return;
    }
    
    // Fast initial check for optimistic rendering
    const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
    if (!requiredRoles || requiredRoles.length === 0 || userRolesArray.includes('system_admin')) {
      console.log('Fast path: No roles required or user is admin');
      setFinalAccess(true);
      return;
    }
    
    // Only verify if we don't have a final access decision
    if (finalAccess === null && !isVerifying) {
      console.log('Starting verification process');
      verifyAccess();
    }
  }, [isLoadingRoles, userRoles, requiredRoles, verifyAccess, finalAccess, isVerifying]);

  // Show loading state only during initial load and only for a limited time
  if ((isLoadingRoles || (finalAccess === null && isVerifying)) && !loadTimeout) {
    console.log('Showing loading state', { isLoadingRoles, finalAccess, isVerifying });
    return (
      <div className="container mx-auto py-4 px-4 flex justify-center items-center min-h-[200px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // If timeout occurred or verification failed, use client-side check as fallback
  if (loadTimeout && finalAccess === null) {
    console.log('Timeout occurred, using client-side check');
    const clientCheck = hasRequiredRole(requiredRoles);
    setFinalAccess(clientCheck);
  }

  // Show access denied screen if verification fails
  if (finalAccess === false) {
    console.log('Access denied, redirecting to', fallbackPath);
    return (
      <div className="container mx-auto py-6 px-4">
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
        <div className="text-center mt-4">
          <Navigate to={fallbackPath} replace />
        </div>
      </div>
    );
  }

  // Render children if access is granted or we're using fallback after timeout
  return <>{children}</>;
}
