
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
import ManagerDashboard from "@/pages/ManagerDashboard";
import CallbackHandler from "@/pages/CallbackHandler";
import OneOnOneManagement from "@/pages/OneOnOneManagement";
import { SidebarProvider } from "@/components/ui/sidebar/sidebar-provider";
import AuthGuard from "@/components/auth/AuthGuard";
import "./App.css";

function App() {
  // Set the document title
  useEffect(() => {
    document.title = "Agent Hub";
  }, []);

  return (
    <BrowserRouter>
      <SidebarProvider>
        <Routes>
          <Route path="/auth" element={<Auth />} />
          <Route path="/callback" element={<CallbackHandler />} />
          <Route path="/*" element={
            <AuthGuard>
              <div className="flex h-screen bg-background">
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                  <Routes>
                    <Route path="/" element={<MainContent />}>
                      <Route index element={<Dashboard />} />
                      <Route path="assessment" element={<Assessment />} />
                      <Route path="submitted-forms" element={<SubmittedForms />} />
                      <Route path="metrics" element={<Dashboard />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="admin" element={<AdminActions />} />
                      <Route path="commission-tracker" element={<CommissionTracker />} />
                      <Route path="role-management" element={<RoleManagement />} />
                      <Route path="team" element={<Team />} />
                      <Route path="one-on-one" element={<OneOnOneManagement />} />
                      <Route path="manager-dashboard" element={<ManagerDashboard />} />
                      <Route path="*" element={<Dashboard />} />
                    </Route>
                  </Routes>
                  <Toaster />
                </main>
              </div>
            </AuthGuard>
          } />
        </Routes>
      </SidebarProvider>
    </BrowserRouter>
  );
}

export default App;
