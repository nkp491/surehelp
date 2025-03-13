
import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invalidateRolesCache } from "@/lib/auth-cache";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
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
    } catch (error) {
      console.error("Failed to clear auth data:", error);
    }
  }, []);

  const handleAuthError = useCallback(async () => {
    clearAuthData();
    try {
      await supabase.auth.signOut();
      toast({
        title: "Session Expired",
        description: "Please sign in again",
        variant: "destructive",
      });
      setIsAuthenticated(false);
      navigate("/auth", { replace: true });
    } catch (error) {
      console.error("Error handling auth error:", error);
    }
  }, [clearAuthData, navigate, toast]);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Try to get session from local storage first for faster initial load
        let checkedLocalStorage = false;
        
        try {
          const localSession = localStorage.getItem('sb-auth-token');
          if (localSession) {
            // Optimistic update to improve perceived performance
            if (mounted && !initialCheckDone.current) {
              setIsAuthenticated(true);
            }
            checkedLocalStorage = true;
          }
        } catch (error) {
          console.error("Error checking local storage:", error);
        }
        
        // Verify with supabase
        const { data: { session } } = await supabase.auth.getSession();
        
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
          
          // Save a token in localStorage for faster checks
          try {
            localStorage.setItem('sb-auth-token', 'exists');
          } catch (error) {
            console.error("Error saving to localStorage:", error);
          }
        }
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) {
          await handleAuthError();
          initialCheckDone.current = true;
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
        
        // Save a token in localStorage for faster checks
        try {
          localStorage.setItem('sb-auth-token', 'exists');
        } catch (error) {
          console.error("Error saving to localStorage:", error);
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast, clearAuthData, handleAuthError]);

  return { isLoading, isAuthenticated };
};
