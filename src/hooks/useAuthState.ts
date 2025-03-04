
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { isPublicRoute } from "@/utils/routeConfig";

export const useAuthState = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const currentPath = location.pathname;

  const clearAuthData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleAuthError = async () => {
    clearAuthData();
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    
    toast({
      title: "Session Expired",
      description: "Please sign in again",
      variant: "destructive",
    });
    
    // Only navigate if we're not already on a public route
    if (!isPublicRoute(currentPath)) {
      navigate("/auth", { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // If we're on a public route, skip authentication check and just set loading to false
        if (isPublicRoute(currentPath)) {
          if (mounted) {
            setIsLoading(false);
          }
          return;
        }

        // For protected routes, check authentication status
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            clearAuthData();
            setIsAuthenticated(false);
            setIsLoading(false);
            
            // Only navigate if we're not already on a public route
            if (!isPublicRoute(currentPath)) {
              console.log("No session, redirecting to /auth", currentPath);
              navigate("/auth", { replace: true });
            }
          }
          return;
        }

        // Only try to refresh if we have a session
        if (session) {
          try {
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.error("Session refresh error:", refreshError);
              if (mounted) {
                await handleAuthError();
              }
              return;
            }
          } catch (refreshError) {
            console.error("Session refresh error:", refreshError);
            if (mounted) {
              await handleAuthError();
            }
            return;
          }
        }

        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          await handleAuthError();
        }
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", { event, session });
      
      if (event === 'SIGNED_OUT') {
        clearAuthData();
        setIsAuthenticated(false);
        
        // Only navigate if we're not already on a public route
        if (!isPublicRoute(currentPath)) {
          navigate("/auth", { replace: true });
        }
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast, currentPath]);

  return { isLoading, isAuthenticated };
};
