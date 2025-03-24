
import { Route, Routes, BrowserRouter } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import MainContent from "@/components/layout/MainContent";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Assessment from "@/pages/Assessment";
import SubmittedForms from "@/pages/SubmittedForms";
import Dashboard from "@/pages/Dashboard";
import Auth from "@/pages/Auth";
import Profile from "@/pages/Profile";
import AdminActions from "@/pages/AdminActions";
import CommissionTracker from "@/pages/CommissionTracker";
import RoleManagement from "@/pages/RoleManagement";
import Team from "@/pages/Team";
import TeamDirectory from "@/pages/TeamDirectory";
import TeamManagement from "@/pages/TeamManagement";
import Notifications from "@/pages/Notifications";
import ManagerDashboard from "@/pages/ManagerDashboard";
import AuthCallback from "@/pages/auth/callback";
import OneOnOneManagement from "@/pages/OneOnOneManagement";
import { SidebarProvider } from "@/components/ui/sidebar";
import AuthGuard from "@/components/auth/AuthGuard";
import { LanguageProvider } from "@/contexts/LanguageContext";
import "./App.css";

function App() {
  // Set the document title
  useEffect(() => {
    document.title = "Agent Hub";
  }, []);

  return (
    <BrowserRouter>
      <LanguageProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/*"
            element={
              <AuthGuard>
                <div className="flex h-screen bg-background">
                  <SidebarProvider>
                    <AppSidebar />
                    <main className="flex-1 overflow-y-auto">
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/assessment" element={<Assessment />} />
                        <Route path="/submitted-forms" element={<SubmittedForms />} />
                        <Route path="/metrics" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/admin" element={<AdminActions />} />
                        <Route path="/commission-tracker" element={<CommissionTracker />} />
                        <Route path="/role-management" element={<RoleManagement />} />
                        <Route path="/team" element={<Team />} />
                        <Route path="/team-directory" element={<TeamDirectory />} />
                        <Route path="/team-management" element={<TeamManagement />} />
                        <Route path="/notifications" element={<Notifications />} />
                        <Route path="/one-on-one" element={<OneOnOneManagement />} />
                        <Route path="/manager-dashboard" element={<ManagerDashboard />} />
                        <Route path="*" element={<Dashboard />} />
                      </Routes>
                      <Toaster />
                    </main>
                  </SidebarProvider>
                </div>
              </AuthGuard>
            }
          />
        </Routes>
      </LanguageProvider>
    </BrowserRouter>
  );
}

export default App;
