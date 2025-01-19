import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Auth from "@/pages/Auth";
import Index from "@/pages/Index";
import Profile from "@/pages/Profile";

export const AuthRoutes = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
          // Clear any stale session data
          await supabase.auth.signOut({ scope: 'local' });
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", { event, session });
      
      if (event === 'SIGNED_OUT') {
        setIsAuthenticated(false);
        localStorage.removeItem('supabase.auth.token');
        return;
      }
      
      if (event === 'SIGNED_IN') {
        setIsAuthenticated(true);
        return;
      }

      if (event === 'TOKEN_REFRESHED') {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (!error && currentSession) {
          setIsAuthenticated(true);
        } else {
          console.error("Session refresh error:", error);
          setIsAuthenticated(false);
          await supabase.auth.signOut({ scope: 'local' });
        }
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading && window.location.pathname !== '/auth') {
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