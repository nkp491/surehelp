import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useAuthState = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  const clearAuthData = () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('sb-')) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleAuthError = async (error: any) => {
    console.error("Auth error:", error);
    
    if (error?.message?.includes('Invalid Refresh Token') || 
        error?.message?.includes('refresh_token_not_found')) {
      clearAuthData();
      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
      return;
    }
    
    // Only show toast for specific errors, not rate limiting
    if (error?.status !== 429) {
      toast({
        title: "Session Error",
        description: "Please sign in again",
        variant: "destructive",
      });
      navigate("/auth", { replace: true });
    }
  };

  useEffect(() => {
    let mounted = true;

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

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error: any) {
        await handleAuthError(error);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", { event, session });
      
      if (event === 'SIGNED_OUT' || event === 'USER_DELETED') {
        clearAuthData();
        navigate("/auth", { replace: true });
      } else if (event === 'SIGNED_IN') {
        setIsLoading(false);
      } else if (event === 'TOKEN_REFRESHED') {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  return { isLoading };
};