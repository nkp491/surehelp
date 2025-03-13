
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
import { toast } from "sonner";

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
  const [stableContent, setStableContent] = useState<ReactNode | null>(null);
  const { timeoutOccurred } = useAuthContext();
  
  // Immediately grant access to system_admin users
  const hasSystemAdminRole = useMemo(() => {
    if (!userRoles || !Array.isArray(userRoles)) return false;
    return userRoles.includes('system_admin');
  }, [userRoles]);

  // Cache key for verification results
  const cacheKey = useMemo(() => {
    return `${location.pathname}:${requiredRoles?.join('|') || 'none'}`;
  }, [location.pathname, requiredRoles]);

  // Once we render the children, store them to prevent disappearing
  useEffect(() => {
    if (finalAccess === true) {
      setStableContent(children);
    }
  }, [finalAccess, children]);

  // Fast safety timeout for role verification
  useEffect(() => {
    const timer = setTimeout(() => {
      if (finalAccess === null) {
        console.log('RoleBasedRoute: Force completion after timeout');
        
        // Grant access if system_admin or temporarily otherwise
        if (hasSystemAdminRole) {
          setFinalAccess(true);
        } else {
          // Default to granting access temporarily - will be verified in background
          setFinalAccess(true);
        }
      }
    }, 300); // Reduced from 400ms for faster response
    
    return () => clearTimeout(timer);
  }, [finalAccess, hasSystemAdminRole]);
  
  // Optimized verification process
  const verifyAccess = useCallback(async () => {
    // Skip verification if no roles are required
    if (!requiredRoles || requiredRoles.length === 0) {
      setFinalAccess(true);
      return;
    }
    
    // Fast path: System admin always gets access
    if (hasSystemAdminRole) {
      console.log('User has system_admin role - granting access');
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
    try {
      const cachedVerification = localStorage.getItem(`role-verify:${cacheKey}`);
      if (cachedVerification !== null) {
        console.log('Using cached route verification result:', cachedVerification);
        setFinalAccess(cachedVerification === 'true');
        return;
      }
    } catch (error) {
      console.error('Error accessing localStorage:', error);
    }
    
    // Default to granting access temporarily
    setFinalAccess(true);
    
    // Verify in background without blocking rendering
    setIsVerifying(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-user-roles', {
        body: { requiredRoles }
      });
      
      if (error) {
        console.error('Error verifying roles:', error);
        toast.error("Error verifying access permissions");
        // Don't change access state on error to avoid disruption
      } else {
        const hasAccess = data?.hasRequiredRole || false;
        
        // Cache the verification result
        try {
          localStorage.setItem(`role-verify:${cacheKey}`, hasAccess.toString());
          cacheVerificationResult(requiredRoles, hasAccess);
        } catch (error) {
          console.error('Error writing to localStorage:', error);
        }
        
        // Only update if verification explicitly denies access
        if (!hasAccess) {
          setFinalAccess(false);
        }
      }
    } catch (err) {
      console.error('Failed to verify roles with server:', err);
      toast.error("Failed to verify permissions");
      // Don't change access state on error
    } finally {
      setIsVerifying(false);
    }
  }, [hasRequiredRole, requiredRoles, cacheKey, hasSystemAdminRole]);

  // Trigger verification process
  useEffect(() => {
    if (isLoadingRoles) return;
    
    // Fast initial check for system admins
    if (hasSystemAdminRole) {
      console.log('System admin detected - immediate access granted');
      setFinalAccess(true);
      return;
    }
    
    // Clear cases that don't need verification
    if (!requiredRoles || requiredRoles.length === 0) {
      setFinalAccess(true);
      return;
    }
    
    // Only verify if we don't have a final access decision
    if (finalAccess === null && !isVerifying) {
      verifyAccess();
    }
  }, [isLoadingRoles, userRoles, requiredRoles, verifyAccess, finalAccess, isVerifying, hasSystemAdminRole]);

  // Always render stable content once it's set, even during verification changes
  if (stableContent) {
    return <>{stableContent}</>;
  }

  // Allow rendering during timeout, for system_admin, or if access is granted
  if (timeoutOccurred || hasSystemAdminRole || finalAccess === true) {
    return <>{children}</>;
  }

  // Show a loading skeleton during verification
  if ((isLoadingRoles || finalAccess === null) && !timeoutOccurred) {
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

  // Fallback loading state
  return <LoadingSkeleton />;
}
