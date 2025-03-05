
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthRoutes } from "@/components/auth/AuthRoutes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MainContent from "@/components/layout/MainContent";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Auth routes rendered without SidebarProvider */}
            <Route path="/auth/*" element={<AuthRoutes />} />
            
            {/* All other routes rendered with SidebarProvider */}
            <Route path="/*" element={<MainContent />} />
          </Routes>
          <Toaster />
        </Router>
      </LanguageProvider>
    </SessionContextProvider>
  );
}

export default App;
