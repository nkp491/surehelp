import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { roleService } from "@/services/roleService";
import { queryClient } from "@/lib/react-query";

export const useAuthState = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLogin, setIsLogin] = useState(false);

  const clearAuthData = () => {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith("sb-")) {
        localStorage.removeItem(key);
      }
    });
  };

  const handleAuthError = async () => {
    clearAuthData();
    await supabase.auth.signOut();
    roleService.clearRoles();
    setIsAuthenticated(false);
    setIsLoading(false);
    queryClient.invalidateQueries({ queryKey: ["team-membership"] });
    queryClient.invalidateQueries({ queryKey: ["team-members"] });
    queryClient.invalidateQueries({ queryKey: ["manager-team"] });
    queryClient.invalidateQueries({ queryKey: ["all-teams-hierarchy"] });
  };

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", { event, session });

      if (event === "SIGNED_OUT") {
        clearAuthData();
        setIsAuthenticated(false);
        // Clear team membership cache when user signs out
        queryClient.invalidateQueries({ queryKey: ["team-membership"] });
        queryClient.invalidateQueries({ queryKey: ["team-members"] });
        queryClient.invalidateQueries({ queryKey: ["manager-team"] });
        queryClient.invalidateQueries({ queryKey: ["all-teams-hierarchy"] });
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setIsAuthenticated(true);
      }
    });

    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          if (mounted) {
            clearAuthData();
            setIsAuthenticated(false);
            setIsLoading(false);
          }
          return;
        }
        if (session) {
          setIsLogin(true);
        }
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Session refresh error:", refreshError);
          if (mounted) await handleAuthError();
          return;
        }
        if (mounted) {
          setIsAuthenticated(true);
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Auth check error:", err);
        if (mounted) await handleAuthError();
      }
    };
    checkAuth();
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { isLoading, isAuthenticated, isLogin };
};
