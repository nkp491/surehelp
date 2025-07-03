import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import Auth from "./pages/Auth";
import CallbackHandler from "./pages/CallbackHandler";
import ResetPassword from "./pages/auth/reset-password";
import MainContent from "./components/layout/MainContent";
import AuthGuard from "./components/auth/AuthGuard";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/react-query";
import TermsOfUse from "./pages/marketing/TermsOfUse";
import Home from "./pages/marketing/Home";
import About from "./pages/marketing/About";
import Pricing from "./pages/marketing/Pricing";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { roleService } from "@/services/roleService";
import ForgotPassword from "./pages/auth/forgot-password";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { SubscriptionGuard } from "./components/auth/SubscriptionGuard";

function App() {
  useEffect(() => {
    const checkSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        roleService.clearRoles();
      }
    };
    checkSession();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <SubscriptionProvider>
        <Router>
          <Routes>
            {/* Marketing pages */}

            <Route path="/" element={
              <SubscriptionGuard>
                <Home />
              </SubscriptionGuard>
            } />
            <Route path="/about" element={
              <SubscriptionGuard>
                <About />
              </SubscriptionGuard>
            } />
            <Route path="/pricing" element={
              <SubscriptionGuard>
                <Pricing />
              </SubscriptionGuard>
            } />

            {/* Authentication routes */}
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/forgot-password" element={<ForgotPassword />} />
            <Route path="/auth/reset-password" element={<ResetPassword />} />
            <Route path="/auth/callback" element={<CallbackHandler />} />
            <Route path="/auth/terms" element={<TermsOfUse />} />

            {/* Protected application routes with sidebar navigation */}
            <Route
              path="/dashboard"
              element={
                <AuthGuard>
                  <Navigate to="/metrics" replace />
                </AuthGuard>
              }
            />
            <Route
              path="/assessment"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/profile"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/metrics"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/submitted-forms"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/manager-dashboard"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/commission-tracker"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/role-management"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/team"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/terms"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/admin"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
            <Route
              path="/admin-actions"
              element={
                <AuthGuard>
                  <MainContent />
                </AuthGuard>
              }
            />
          </Routes>
        </Router>
      </SubscriptionProvider>
    </QueryClientProvider>
  );
}

export default App;
