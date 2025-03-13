
import { ReactNode, useEffect, useState, useCallback, useMemo } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { 
  cacheVerificationResult, 
  getVerificationFromCache
} from "@/lib/auth-cache";
import { useAuthContext } from "@/components/auth/AuthGuard";
import LoadingSkeleton from "@/components/ui/loading-skeleton";

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
  const location = useLocation();
  const { hasRequiredRole, isLoadingRoles, userRoles } = useRoleCheck();
  const [isVerifying, setIsVerifying] = useState(false);
  const [serverVerified, setServerVerified] = useState(false);
  const [finalAccess, setFinalAccess] = useState<boolean | null>(null);
  const { timeoutOccurred } = useAuthContext();
  
  // Faster timeout for role verification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isVerifying || finalAccess === null) {
        console.log('RoleBasedRoute: Force completion after short timeout');
        
        // Use client-side role check as fallback
        if (finalAccess === null) {
          const clientCheck = hasRequiredRole(requiredRoles);
          console.log('Using client-side check as fallback:', clientCheck);
          setFinalAccess(clientCheck);
        }
      }
    }, 1000); // Reduced from 3000ms to 1000ms
    
    return () => clearTimeout(timer);
  }, [isVerifying, finalAccess, hasRequiredRole, requiredRoles]);
  
  // Cache path-based verification results to speed up repeat visits
  const cacheKey = useMemo(() => {
    return `${location.pathname}:${requiredRoles?.join('|') || 'none'}`;
  }, [location.pathname, requiredRoles]);
  
  // Optimize verification with route-based caching
  const verifyAccess = useCallback(async () => {
    // Skip verification if no roles are required
    if (!requiredRoles || requiredRoles.length === 0) {
      setFinalAccess(true);
      return;
    }
    
    // Fast path: System admin always gets access
    const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
    if (userRolesArray.includes('system_admin')) {
      setFinalAccess(true);
      return;
    }

    // Fast path: Client-side verification passes
    const clientVerified = hasRequiredRole(requiredRoles);
    if (clientVerified) {
      setFinalAccess(true);
      return;
    }
    
    // Check cache with location-aware key for previous verification result
    const cachedVerification = localStorage.getItem(`role-verify:${cacheKey}`);
    if (cachedVerification !== null) {
      const result = cachedVerification === 'true';
      console.log('Using cached route verification result:', result);
      setServerVerified(result);
      setFinalAccess(result);
      return;
    }
    
    // Only verify with server as last resort
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
        
        // Cache the verification result with path info
        localStorage.setItem(`role-verify:${cacheKey}`, hasAccess.toString());
        cacheVerificationResult(requiredRoles, hasAccess);
      }
    } catch (err) {
      console.error('Failed to verify roles with server:', err);
      setServerVerified(false);
      setFinalAccess(false);
    } finally {
      setIsVerifying(false);
    }
  }, [hasRequiredRole, requiredRoles, userRoles, cacheKey]);

  // Trigger verification process when dependencies change
  useEffect(() => {
    // Skip if still loading roles
    if (isLoadingRoles) {
      return;
    }
    
    // Fast initial check for optimistic rendering
    const userRolesArray = Array.isArray(userRoles) ? userRoles : [];
    if (!requiredRoles || requiredRoles.length === 0 || userRolesArray.includes('system_admin')) {
      setFinalAccess(true);
      return;
    }
    
    // Only verify if we don't have a final access decision
    if (finalAccess === null && !isVerifying) {
      verifyAccess();
    }
  }, [isLoadingRoles, userRoles, requiredRoles, verifyAccess, finalAccess, isVerifying]);

  // Use optimistic rendering after timeout
  if (timeoutOccurred && finalAccess === null) {
    console.log('Role check timeout, using optimistic rendering');
    // Show content while verification happens in background
    return <>{children}</>;
  }

  // Show skeleton loading instead of full-page loading indicator
  if ((isLoadingRoles || (finalAccess === null && isVerifying))) {
    return <LoadingSkeleton />;
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

  // Render children if access is granted
  return <>{children}</>;
}
