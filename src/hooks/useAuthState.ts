
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to manage authentication state changes - without navigation
 * dependency to avoid React Router context issues
 */
export const useAuthState = () => {
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      // Handle auth state changes without navigation to prevent context issues
      if (event === "SIGNED_OUT") {
        // Instead of navigating directly, we can optionally redirect using window.location
        // This avoids React Router context issues
        window.location.href = "/auth";
      }
    });

    return () => subscription.unsubscribe();
  }, []);
};
