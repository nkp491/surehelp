
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invalidateRolesCache } from "@/lib/auth-cache";
import { toast } from "sonner";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { toast: uiToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const initialCheckDone = useRef(false);

  const clearAuthData = useCallback(() => {
    invalidateRolesCache();
    
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-') || key.startsWith('role-verify:') || key.startsWith('role-verification:')) {
          localStorage.removeItem(key);
        }
      });
      
      // Also clear session storage
      sessionStorage.removeItem('is-authenticated');
      sessionStorage.removeItem('nav-items');
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  }, []);

  const handleAuthError = useCallback(async () => {
    clearAuthData();
    try {
      await supabase.auth.signOut();
      toast.error("Session expired. Please sign in again");
      setIsAuthenticated(false);
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error handling auth error:", error);
    }
  }, [clearAuthData, navigate]);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");
        
        // Try to get session from storage first for faster initial load
        try {
          const sessionAuth = sessionStorage.getItem('is-authenticated');
          if (sessionAuth === 'true' && !initialCheckDone.current) {
            console.log("Found auth token in sessionStorage, setting authenticated");
            setIsAuthenticated(true);
          }
          
          const localSession = localStorage.getItem('sb-auth-token');
          if (localSession && !initialCheckDone.current) {
            console.log("Found auth token in localStorage, setting authenticated");
            setIsAuthenticated(true);
          }
        } catch (error) {
          console.error("Error checking storage:", error);
        }
        
        // Verify with supabase
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Supabase session check result:", !!session);
        
        if (!session) {
          if (mounted) {
            clearAuthData();
            setIsAuthenticated(false);
            setIsLoading(false);
            initialCheckDone.current = true;
          }
          return;
        }

        // Session exists, so user is authenticated
        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
          initialCheckDone.current = true;
          
          // Save auth state to storage for faster checks
          try {
            localStorage.setItem('sb-auth-token', 'exists');
            sessionStorage.setItem('is-authenticated', 'true');
          } catch (error) {
            console.error("Error saving to storage:", error);
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          await handleAuthError();
          initialCheckDone.current = true;
          setIsLoading(false);
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
        setIsLoading(false);
        initialCheckDone.current = true;
        navigate("/auth", { replace: true });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
        setIsLoading(false);
        initialCheckDone.current = true;
        
        // Save auth state to storage for faster checks
        try {
          localStorage.setItem('sb-auth-token', 'exists');
          sessionStorage.setItem('is-authenticated', 'true');
        } catch (error) {
          console.error("Error saving to storage:", error);
        }
        
        // If we were previously on the auth page, navigate to dashboard
        if (window.location.pathname.includes('/auth')) {
          navigate('/', { replace: true });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, clearAuthData, handleAuthError]);

  return { isLoading, isAuthenticated };
};
