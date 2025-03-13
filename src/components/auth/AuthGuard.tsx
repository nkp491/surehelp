
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
  
  useEffect(() => {
    console.log('AuthGuard: Auth state:', { isLoading, isAuthenticated, isInitialCheck });
    
    // Add a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isInitialCheck && isLoading) {
        console.log('AuthGuard: Forcing initial check completion after timeout');
        setIsInitialCheck(false);
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

  // Show loading only on initial check
  if (isLoading && isInitialCheck) {
    return <LoadingScreen message="Verifying authentication..." />;
  }
  
  if (!isAuthenticated && !isLoading) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
