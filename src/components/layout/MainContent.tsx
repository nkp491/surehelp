import { useLocation } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SubmittedForms from "@/pages/SubmittedForms";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Profile from "@/pages/Profile";
import FormContainer from "@/components/FormContainer";
import AuthGuard from "@/components/auth/AuthGuard";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";

const MainContent = () => {
  const location = useLocation();

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
        default:
          return <Dashboard />;
      }
    };

    // Wrap all protected routes with AuthGuard
    if (location.pathname !== '/auth') {
      return <AuthGuard>{protectedContent()}</AuthGuard>;
    }

    return protectedContent();
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="pt-2">
          {renderContent()}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainContent;