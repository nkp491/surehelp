import { useLocation } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SubmittedForms from "@/pages/SubmittedForms";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Profile from "@/pages/Profile";
import FormContainer from "@/components/FormContainer";
import AuthGuard from "@/components/auth/AuthGuard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import Auth from "@/pages/Auth";
import CommissionTracker from "@/pages/CommissionTracker";

const MainContent = () => {
  const location = useLocation();

  // If we're on the auth page, render it directly without the sidebar layout
  if (location.pathname === '/auth') {
    return <Auth />;
  }

  // For all other routes, use the sidebar layout
  const renderContent = () => {
    // Only render auth-protected content
    const protectedContent = () => {
      switch (location.pathname) {
        case '/metrics':
          return <Dashboard />;
        case '/submitted-forms':
          return <SubmittedForms />;
        case '/manager-dashboard':
          return <ManagerDashboard />;
        case '/profile':
          return <Profile />;
        case '/assessment':
          return <FormContainer />;
        case '/commission-tracker':
          return <CommissionTracker />;
        default:
          return <Dashboard />;
      }
    };

    return <AuthGuard>{protectedContent()}</AuthGuard>;
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1 transition-all duration-200">
          <div className="w-full max-w-[95vw] mx-auto">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainContent;
