
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthRoutes } from "@/components/auth/AuthRoutes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MainContent from "@/components/layout/MainContent";
import Index from "@/pages/Index";
import TermsOfUse from "@/pages/marketing/TermsOfUse";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Public routes - no authentication required */}
            <Route path="/terms" element={<TermsOfUse />} />
            
            {/* Auth routes - no authentication required */}
            <Route path="/auth/*" element={<AuthRoutes />} />
            
            {/* Root route with Index page, already has AuthGuard inside */}
            <Route path="/" element={<Index />} />
            
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
