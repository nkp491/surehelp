import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefreshAttempt, setLastRefreshAttempt] = useState(0);
  const REFRESH_COOLDOWN = 5000; // 5 seconds cooldown between refresh attempts

  const clearAuthData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleAuthError = async (error: any) => {
    console.error("Auth error:", error);
    
    // Only show toast for specific errors, not rate limiting
    if (error?.status !== 429) {
      clearAuthData();
      await supabase.auth.signOut();
      toast({
        title: "Session Error",
        description: "Please sign in again",
        variant: "destructive",
      });
    }
    navigate("/auth", { replace: true });
  };

  useEffect(() => {
    let mounted = true;
    let refreshTimeout: NodeJS.Timeout;

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!session) {
          if (mounted) {
            clearAuthData();
            navigate("/auth", { replace: true });
          }
          return;
        }

        // Only attempt refresh if enough time has passed since last attempt
        const now = Date.now();
        if (now - lastRefreshAttempt >= REFRESH_COOLDOWN) {
          setLastRefreshAttempt(now);
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) throw refreshError;
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error: any) {
        // Don't trigger auth error handler for rate limit errors
        if (error?.status === 429) {
          console.warn("Rate limit reached, waiting before next refresh attempt");
          // Set a timeout to try again after the cooldown
          refreshTimeout = setTimeout(checkAuth, REFRESH_COOLDOWN);
        } else {
          await handleAuthError(error);
        }
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", { event, session });
      
      if (event === 'SIGNED_OUT') {
        clearAuthData();
        navigate("/auth", { replace: true });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      if (refreshTimeout) clearTimeout(refreshTimeout);
      subscription.unsubscribe();
    };
  }, [navigate, toast, lastRefreshAttempt]);

  return { isLoading };
};