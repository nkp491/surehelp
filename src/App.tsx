import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import "./App.css";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import SubmittedForms from "./pages/SubmittedForms";

function AppRoutes() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log("Initial session check:", { session, error });
      setIsAuthenticated(!!session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", { event, session });
      setIsAuthenticated(!!session);
      
      // If session expired or user signed out, refresh the page to clear any stale data
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED') {
        window.location.reload();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return <div>Loading...</div>;
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
    </Routes>
  );
}

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </SessionContextProvider>
  );
}

export default App;