
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

/**
 * Hook for auth-related actions like sign out and auth state change
 */
export const useAuthActions = (refetch: () => Promise<any>) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // Auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        navigate("/auth");
      } else if (event === "USER_UPDATED") {
        // Refresh profile data when user is updated
        refetch();
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, refetch]);

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      });
    } else {
      navigate("/auth");
    }
  }

  return {
    signOut
  };
};
