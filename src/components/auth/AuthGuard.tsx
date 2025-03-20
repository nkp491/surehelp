
import { useEffect, useState, useContext, createContext } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { invalidateRolesCache } from "@/lib/auth-cache";
import { toast } from "sonner";

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
  const { toast: uiToast } = useToast();
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  const [allowRender, setAllowRender] = useState(false);
  
  console.log("AuthGuard: Auth state", { isLoading, isAuthenticated, isInitialCheck, timeoutOccurred, allowRender });

  // Fast path for repeat visits - check session storage first
  useEffect(() => {
    try {
      const isAuth = sessionStorage.getItem('is-authenticated');
      if (isAuth === 'true' && isInitialCheck) {
        console.log('Quick auth check: Using sessionStorage auth state');
        setAllowRender(true);
      }
    } catch (e) {
      console.error('Error reading session storage:', e);
    }
  }, [isInitialCheck]);
  
  // Safety timeout - reduced to 100ms for faster UI response
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isInitialCheck && isLoading) {
        console.log('AuthGuard: Force ending initial check after timeout');
        setIsInitialCheck(false);
        setTimeoutOccurred(true);
        
        // If we at least have a token in localStorage or sessionStorage, allow rendering
        try {
          // Check sessionStorage first (faster)
          const sessionAuth = sessionStorage.getItem('is-authenticated');
          if (sessionAuth === 'true') {
            console.log('AuthGuard: Found auth token in sessionStorage, allowing render');
            setAllowRender(true);
            return;
          }
          
          // Fall back to localStorage
          const hasToken = localStorage.getItem('sb-auth-token');
          if (hasToken) {
            console.log('AuthGuard: Found token in localStorage, allowing render');
            setAllowRender(true);
            
            // Save to sessionStorage for faster future checks
            try {
              sessionStorage.setItem('is-authenticated', 'true');
            } catch (e) {
              console.error('Error saving to sessionStorage:', e);
            }
          }
        } catch (e) {
          console.error('AuthGuard: Error checking storage', e);
        }
        
        // Only allow rendering if we're definitely not unauthenticated
        if (isAuthenticated !== false) {
          setAllowRender(true);
        }
      }
    }, 100);
    
    // If authentication check is complete
    if (!isLoading) {
      if (isAuthenticated === false) {
        console.log('AuthGuard: User is not authenticated, navigating to auth page');
        // Invalidate role cache when logging out
        invalidateRolesCache();
        
        // Clear sessionStorage auth flag
        try {
          sessionStorage.removeItem('is-authenticated');
        } catch (e) {
          console.error('Error clearing sessionStorage:', e);
        }
        
        toast.error("Authentication required");
        navigate("/auth", { replace: true });
      } else {
        console.log('AuthGuard: User is authenticated, allowing render');
        // User is authenticated, allow rendering
        setAllowRender(true);
        
        // Save authentication state to sessionStorage for faster future checks
        try {
          sessionStorage.setItem('is-authenticated', 'true');
        } catch (e) {
          console.error('Error saving to sessionStorage:', e);
        }
      }
      setIsInitialCheck(false);
    }
    
    return () => clearTimeout(timeoutId);
  }, [isLoading, isAuthenticated, navigate, uiToast, isInitialCheck]);

  // Show loading only on initial check and only briefly
  if (isLoading && isInitialCheck && !timeoutOccurred && !allowRender) {
    return <LoadingScreen message="Loading authentication..." />;
  }
  
  // Don't render anything if definitely not authenticated
  if (isAuthenticated === false && !isLoading) {
    return null;
  }

  // Always render content with authContext if allowRender is true
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
