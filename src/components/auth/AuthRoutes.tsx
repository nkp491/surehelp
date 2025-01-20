import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";

export const AuthRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Session error:", sessionError);
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        if (!session) {
          // Clear any stale auth data
          await supabase.auth.signOut();
          setIsAuthenticated(false);
          setIsLoading(false);
          return;
        }

        // Attempt to refresh the session
        const { error: refreshError } = await supabase.auth.refreshSession();
        if (refreshError) {
          console.error("Refresh error:", refreshError);
          // If refresh fails, sign out and clear session
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
        setIsLoading(false);
      } catch (error) {
        console.error("Auth error:", error);
        // Handle any unexpected errors by signing out
        await supabase.auth.signOut();
        setIsAuthenticated(false);
        setIsLoading(false);
        toast({
          title: "Authentication Error",
          description: "Please sign in again",
          variant: "destructive",
        });
      }
    };

    // Initial session check
    checkSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", { event, session });
      
      switch (event) {
        case "SIGNED_IN":
          setIsAuthenticated(true);
          setIsLoading(false);
          break;
        case "SIGNED_OUT":
          setIsAuthenticated(false);
          setIsLoading(false);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <Routes>
      <Route 
        path="/auth" 
        element={isAuthenticated ? <Navigate to="/assessment" replace /> : <Auth />} 
      />
      <Route 
        path="/" 
        element={<Navigate to="/assessment" replace />} 
      />
      <Route 
        path="/profile" 
        element={isAuthenticated ? <Profile /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/metrics" 
        element={isAuthenticated ? <Index /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/submitted-forms" 
        element={isAuthenticated ? <Index /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/manager-dashboard" 
        element={isAuthenticated ? <Index /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="/assessment" 
        element={isAuthenticated ? <Index /> : <Navigate to="/auth" replace />} 
      />
      <Route 
        path="*" 
        element={<Navigate to="/auth" replace />} 
      />
    </Routes>
  );
};