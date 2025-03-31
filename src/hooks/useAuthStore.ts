
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRolesCache } from "@/hooks/useRolesCache";
import { queryClient } from "@/lib/react-query";

export const useAuthStore = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { refetchRoles } = useRolesCache();

  const refreshRoles = useCallback(async () => {
    console.log("Refreshing roles after auth state change");
    await refetchRoles();
  }, [refetchRoles]);

  const checkSession = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Session error:", sessionError);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (!session) {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Refresh error:", refreshError);
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        toast({
          title: "Session Expired",
          description: "Please sign in again",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      // Refresh roles when authentication is confirmed
      await refreshRoles();
      setIsLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setIsLoading(false);
      toast({
        title: "Authentication Error",
        description: "Please sign in again",
        variant: "destructive",
      });
    }
  }, [toast, refreshRoles]);

  useEffect(() => {
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", { event, session });
      
      switch (event) {
        case "SIGNED_IN":
          setIsAuthenticated(true);
          // Invalidate and refetch roles when user signs in
          queryClient.invalidateQueries({ queryKey: ['user-roles'] });
          await refreshRoles();
          setIsLoading(false);
          break;
        case "SIGNED_OUT":
          setIsAuthenticated(false);
          setIsLoading(false);
          break;
        case "TOKEN_REFRESHED":
          setIsAuthenticated(!!session);
          // Refresh roles on token refresh
          await refreshRoles();
          setIsLoading(false);
          break;
        case "USER_UPDATED":
          setIsAuthenticated(!!session);
          // Refresh roles when user data is updated
          await refreshRoles();
          setIsLoading(false);
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkSession, refreshRoles]);

  return { isAuthenticated, isLoading, checkSession, refreshRoles };
};
