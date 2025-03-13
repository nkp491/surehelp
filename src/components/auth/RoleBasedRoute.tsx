
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
  const [finalAccess, setFinalAccess] = useState<boolean | null>(null);
  const { timeoutOccurred } = useAuthContext();
  
  // Much faster timeout for role verification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (finalAccess === null) {
        console.log('RoleBasedRoute: Force completion after very short timeout');
        
        // Always grant access temporarily - will be verified in background
        setFinalAccess(true);
      }
    }, 400); // Extremely short timeout to prevent "stuck" pages
    
    return () => clearTimeout(timer);
  }, [finalAccess]);
  
  // Cache key for verification results
  const cacheKey = useMemo(() => {
    return `${location.pathname}:${requiredRoles?.join('|') || 'none'}`;
  }, [location.pathname, requiredRoles]);
  
  // Simplified verification with optimistic rendering
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
    
    // Check cache for previous verification result
    const cachedVerification = localStorage.getItem(`role-verify:${cacheKey}`);
    if (cachedVerification !== null) {
      console.log('Using cached route verification result:', cachedVerification);
      setFinalAccess(cachedVerification === 'true');
      return;
    }
    
    // Default to granting access while verification happens in background
    setFinalAccess(true);
    
    // Verify in background without blocking rendering
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-user-roles', {
        body: { requiredRoles }
      });
      
      if (error) {
        console.error('Error verifying roles:', error);
        // Only update if user doesn't have access
        if (!data?.hasRequiredRole) {
          setFinalAccess(false);
        }
      } else {
        const hasAccess = data?.hasRequiredRole || false;
        // Cache the verification result
        localStorage.setItem(`role-verify:${cacheKey}`, hasAccess.toString());
        cacheVerificationResult(requiredRoles, hasAccess);
        
        // Only redirect if verification fails
        if (!hasAccess) {
          setFinalAccess(false);
        }
      }
    } catch (err) {
      console.error('Failed to verify roles with server:', err);
      // Don't block the UI - verification will happen next time
    } finally {
      setIsVerifying(false);
    }
  }, [hasRequiredRole, requiredRoles, userRoles, cacheKey]);

  // Trigger verification process
  useEffect(() => {
    if (isLoadingRoles) return;
    
    // Fast initial check
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

  // Always render content during timeout or while loading
  if (timeoutOccurred || finalAccess === null) {
    return <>{children}</>;
  }

  // Show a loading skeleton, but only for a very brief period
  if (isLoadingRoles && !timeoutOccurred) {
    return <LoadingSkeleton />;
  }

  // Show access denied screen if verification explicitly fails
  if (finalAccess === false) {
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
