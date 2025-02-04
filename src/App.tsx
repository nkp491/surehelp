import React from "react";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthRoutes } from "@/components/auth/AuthRoutes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { SidebarProvider } from "@/components/ui/sidebar";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <LanguageProvider>
        <Router>
          <SidebarProvider defaultOpen={true}>
            <div className="app-container">
              <AuthRoutes />
              <Toaster />
            </div>
          </SidebarProvider>
        </Router>
      </LanguageProvider>
    </SessionContextProvider>
  );
}

export default App;