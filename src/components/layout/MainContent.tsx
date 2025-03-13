
import { useLocation } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import SubmittedForms from "@/pages/SubmittedForms";
import ManagerDashboard from "@/pages/ManagerDashboard";
import Profile from "@/pages/Profile";
import FormContainer from "@/components/FormContainer";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import CommissionTracker from "@/pages/CommissionTracker";
import RoleManagement from "@/pages/RoleManagement";

const MainContent = () => {
  const location = useLocation();

  const renderContent = () => {
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
      case '/role-management':
        return <RoleManagement />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {renderContent()}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainContent;
