import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthRoutes } from "@/components/auth/AuthRoutes";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <Router>
        <div className="app-container">
          <AuthRoutes />
          <Toaster />
        </div>
      </Router>
    </SessionContextProvider>
  );
}

export default App;