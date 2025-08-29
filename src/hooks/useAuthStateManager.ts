import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { roleService } from "@/services/roleService";
import { queryClient } from "@/lib/react-query";

export const useAuthStateManager = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkSession = async () => {
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error:", sessionError);
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      if (!session) {
        await supabase.auth.signOut();
        roleService.clearRoles();
        setIsAuthenticated(false);
        setIsLoading(false);
        // Clear team membership cache when no session
        queryClient.invalidateQueries({ queryKey: ["team-membership"] });
        queryClient.invalidateQueries({ queryKey: ["team-members"] });
        queryClient.invalidateQueries({ queryKey: ["manager-team"] });
        queryClient.invalidateQueries({ queryKey: ["all-teams-hierarchy"] });
        return;
      }

      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) {
        console.error("Refresh error:", refreshError);
        await supabase.auth.signOut();
        roleService.clearRoles();
        setIsAuthenticated(false);
        // Clear team membership cache on refresh error
        queryClient.invalidateQueries({ queryKey: ["team-membership"] });
        queryClient.invalidateQueries({ queryKey: ["team-members"] });
        queryClient.invalidateQueries({ queryKey: ["manager-team"] });
        queryClient.invalidateQueries({ queryKey: ["all-teams-hierarchy"] });
        toast({
          title: "Session Expired",
          description: "Please sign in again",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (error) {
      console.error("Auth error:", error);
      await supabase.auth.signOut();
      roleService.clearRoles();
      setIsAuthenticated(false);
      setIsLoading(false);
      // Clear team membership cache on auth error
      queryClient.invalidateQueries({ queryKey: ["team-membership"] });
      queryClient.invalidateQueries({ queryKey: ["team-members"] });
      queryClient.invalidateQueries({ queryKey: ["manager-team"] });
      queryClient.invalidateQueries({ queryKey: ["all-teams-hierarchy"] });
      toast({
        title: "Authentication Error",
        description: "Please sign in again",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    checkSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", { event, session });

      switch (event) {
        case "SIGNED_IN":
          setIsAuthenticated(true);
          setIsLoading(false);
          break;
        case "SIGNED_OUT":
          setIsAuthenticated(false);
          setIsLoading(false);
          // Clear team membership cache when user signs out
          queryClient.invalidateQueries({ queryKey: ["team-membership"] });
          queryClient.invalidateQueries({ queryKey: ["team-members"] });
          queryClient.invalidateQueries({ queryKey: ["manager-team"] });
          queryClient.invalidateQueries({ queryKey: ["all-teams-hierarchy"] });
          break;
        case "TOKEN_REFRESHED":
          setIsAuthenticated(!!session);
          setIsLoading(false);
          break;
        case "USER_UPDATED":
          setIsAuthenticated(!!session);
          setIsLoading(false);
          break;
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [toast]);

  return { isAuthenticated, isLoading };
};
