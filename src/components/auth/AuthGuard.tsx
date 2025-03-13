
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { invalidateRolesCache } from "@/lib/auth-cache";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
  useEffect(() => {
    console.log('AuthGuard: Auth state:', { isLoading, isAuthenticated, isInitialCheck });
    
    // Add a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isInitialCheck && (isLoading || isAuthenticated === null)) {
        console.log('AuthGuard: Forcing initial check completion after timeout');
        setIsInitialCheck(false);
        setTimeoutOccurred(true);
      }
    }, 2000); // 2 second safety timeout
    
    if (!isLoading) {
      if (isAuthenticated === false) {
        console.log('AuthGuard: User not authenticated, redirecting to auth');
        // Invalidate role cache when logging out
        invalidateRolesCache();
        navigate("/auth", { replace: true });
      }
      setIsInitialCheck(false);
    }
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, isAuthenticated, navigate, toast, isInitialCheck]);

  // Show loading only on initial check and not after timeout
  if (isLoading && isInitialCheck && !timeoutOccurred) {
    return <LoadingScreen message="Verifying authentication..." />;
  }
  
  // If timeout occurred but we're still not sure, assume user is authenticated
  // This prevents infinite loading screens
  if (timeoutOccurred && isAuthenticated === null) {
    console.log('AuthGuard: Using optimistic rendering after timeout');
    // Try to access the page, the server will reject if not authenticated
    return <>{children}</>;
  }
  
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
