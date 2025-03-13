import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { SessionContextProvider } from "@supabase/auth-helpers-react";
import { supabase } from "@/integrations/supabase/client";
import { AuthRoutes } from "@/components/auth/AuthRoutes";
import { LanguageProvider } from "@/contexts/LanguageContext";
import MainContent from "@/components/layout/MainContent";
import Home from "@/pages/marketing/Home";
import Pricing from "@/pages/marketing/Pricing";
import Products from "@/pages/marketing/Products";
import About from "@/pages/marketing/About";
import TermsOfUse from "@/pages/marketing/TermsOfUse";
import AuthGuard from "@/components/auth/AuthGuard";
import RoleManagement from "@/pages/RoleManagement";

function App() {
  return (
    <SessionContextProvider supabaseClient={supabase}>
      <LanguageProvider>
        <Router>
          <Routes>
            {/* Marketing pages (accessible whether logged in or not) */}
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/products" element={<Products />} />
            <Route path="/terms" element={<TermsOfUse />} />
            
            {/* Auth routes */}
            <Route path="/auth/*" element={<AuthRoutes />} />
            
            {/* Protected application routes */}
            <Route path="/metrics" element={<AuthGuard><MainContent /></AuthGuard>} />
            <Route path="/submitted-forms" element={<AuthGuard><MainContent /></AuthGuard>} />
            <Route path="/manager-dashboard" element={<AuthGuard><MainContent /></AuthGuard>} />
            <Route path="/profile" element={<AuthGuard><MainContent /></AuthGuard>} />
            <Route path="/assessment" element={<AuthGuard><MainContent /></AuthGuard>} />
            <Route path="/commission-tracker" element={<AuthGuard><MainContent /></AuthGuard>} />
            <Route path="/role-management" element={<RoleManagement />} />
            
            {/* Redirect any other routes to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster />
        </Router>
      </LanguageProvider>
    </SessionContextProvider>
  );
}

export default App;
