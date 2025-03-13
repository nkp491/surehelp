
import { useEffect, useState, useContext, createContext } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { invalidateRolesCache } from "@/lib/auth-cache";

// Create a context to share auth state across components
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  timeoutOccurred: boolean;
};

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  timeoutOccurred: false
});

export const useAuthContext = () => useContext(AuthContext);

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
    // Much shorter safety timeout to prevent long loading screens
    const timeoutId = setTimeout(() => {
      if (isInitialCheck && isLoading) {
        console.log('AuthGuard: Forcing initial check completion after very short timeout');
        setIsInitialCheck(false);
        setTimeoutOccurred(true);
      }
    }, 500); // Reduced to 500ms for faster rendering
    
    if (!isLoading) {
      if (isAuthenticated === false) {
        // Invalidate role cache when logging out
        invalidateRolesCache();
        navigate("/auth", { replace: true });
      }
      setIsInitialCheck(false);
    }
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, isAuthenticated, navigate, toast, isInitialCheck]);

  // Show loading only on initial check and only briefly
  if (isLoading && isInitialCheck && !timeoutOccurred) {
    return <LoadingScreen message="Loading..." />;
  }
  
  // Allow rendering even if authentication is still being verified
  // This prevents the "stuck" loading state
  const shouldAllowRender = 
    isAuthenticated || 
    (timeoutOccurred && isAuthenticated !== false) || 
    (!isLoading && isAuthenticated !== false);

  // Don't render anything if definitely not authenticated
  if (isAuthenticated === false && !isLoading) {
    return null;
  }

  // Provide auth context to all children
  return (
    <AuthContext.Provider 
      value={{ 
        isAuthenticated: !!shouldAllowRender, 
        isLoading: isLoading && !timeoutOccurred,
        timeoutOccurred
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthGuard;
