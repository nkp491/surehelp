import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";
import { useToast } from "@/hooks/use-toast";

export const AuthRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        
        if (mounted) {
          setIsAuthenticated(!!session);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Session check error:", error);
        if (mounted) {
          setIsAuthenticated(false);
          setIsLoading(false);
          toast({
            title: "Session Error",
            description: "There was an error checking your session. Please try signing in again.",
            variant: "destructive",
          });
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", { event, session });
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setIsAuthenticated(true);
        setIsLoading(false);
        return;
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [toast]);

  // Only show loading state for a brief moment during initial load
  if (isLoading && isAuthenticated === null) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50">
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