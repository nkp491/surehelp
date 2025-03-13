
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
  const [allowRender, setAllowRender] = useState(false);
  
  // Use useEffect for the initial authentication check
  useEffect(() => {
    // This is a safety timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isInitialCheck && isLoading) {
        console.log('AuthGuard: Forcing initial check completion after timeout');
        setIsInitialCheck(false);
        setTimeoutOccurred(true);
        
        // Only allow rendering if we're definitely not unauthenticated
        if (isAuthenticated !== false) {
          setAllowRender(true);
        }
      }
    }, 500); // Adjusted from 800ms
    
    // If authentication check is complete
    if (!isLoading) {
      if (isAuthenticated === false) {
        console.log('AuthGuard: User is not authenticated, navigating to auth page');
        // Invalidate role cache when logging out
        invalidateRolesCache();
        navigate("/auth", { replace: true });
      } else {
        console.log('AuthGuard: User is authenticated, allowing render');
        // User is authenticated, allow rendering
        setAllowRender(true);
      }
      setIsInitialCheck(false);
    }
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, isAuthenticated, navigate, toast, isInitialCheck]);

  // Show loading only on initial check and only briefly
  if (isLoading && isInitialCheck && !timeoutOccurred) {
    return <LoadingScreen message="Loading authentication..." />;
  }
  
  // Don't render anything if definitely not authenticated
  if (isAuthenticated === false && !isLoading) {
    return null;
  }

  // Always render content with authContext if allowRender is true
  // This ensures we don't flash content and then remove it
  if (allowRender || (timeoutOccurred && isAuthenticated !== false)) {
    console.log('AuthGuard: Rendering children with AuthContext');
    return (
      <AuthContext.Provider 
        value={{ 
          isAuthenticated: isAuthenticated === true, 
          isLoading: isLoading && !timeoutOccurred,
          timeoutOccurred
        }}
      >
        {children}
      </AuthContext.Provider>
    );
  }
  
  // Show a loading screen during any other state
  return <LoadingScreen message="Verifying access..." />;
};

export default AuthGuard;
