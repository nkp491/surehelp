import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SessionContextProvider, Session } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthRoutes } from "@/components/auth/AuthRoutes";
import { useState, useEffect } from "react";

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      console.log("Auth state changed:", { event: _event, session });
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <React.StrictMode>
      <SessionContextProvider 
        supabaseClient={supabase}
        initialSession={session}
      >
        <Router>
          <AuthRoutes />
          <Toaster />
        </Router>
      </SessionContextProvider>
    </React.StrictMode>
  );
}

export default App;