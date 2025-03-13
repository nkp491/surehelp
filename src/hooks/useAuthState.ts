
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { invalidateRolesCache } from "@/lib/auth-cache";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const clearAuthData = useCallback(() => {
    invalidateRolesCache();
    
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  const handleAuthError = useCallback(async () => {
    clearAuthData();
    await supabase.auth.signOut();
    toast({
      title: "Session Expired",
      description: "Please sign in again",
      variant: "destructive",
    });
    setIsAuthenticated(false);
    navigate("/auth", { replace: true });
  }, [clearAuthData, navigate, toast]);

  useEffect(() => {
    let mounted = true;

    const checkAuth = async () => {
      try {
        // Try to get session from local storage first for faster initial load
        const localSession = localStorage.getItem('sb-auth-token');
        if (localSession) {
          // Optimistic update to improve perceived performance
          setIsAuthenticated(true);
        }
        
        // Verify with supabase
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          if (mounted) {
            clearAuthData();
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }

        // Session exists, so user is authenticated
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
        navigate("/auth", { replace: true });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast, clearAuthData, handleAuthError]);

  return { isLoading, isAuthenticated };
};
