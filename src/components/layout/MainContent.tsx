
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
import TeamPage from "@/pages/Team";
import AdminActionsPage from "@/components/admin/AdminActionsPage";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { navigationItems } from "./sidebar/navigationItems";
import TermsOfUse from "@/pages/marketing/TermsOfUse";

const MainContent = () => {
  const location = useLocation();

  // Find the current navigation item to get the required roles
  const currentNavItem = navigationItems.find(item => item.path === location.pathname);
  const requiredRoles = currentNavItem?.requiredRoles;

  const renderContent = () => {
    const Component = (() => {
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
        case '/team':
          return <TeamPage />;
        case '/terms':
          return <TermsOfUse />;
        case '/admin':
        case '/admin-actions':
          return <AdminActionsPage />;
        default:
          return <Dashboard />;
      }
    })();

    // Wrap with role protection if the path requires specific roles
    if (requiredRoles) {
      return (
        <RoleBasedRoute requiredRoles={requiredRoles}>
          {Component}
        </RoleBasedRoute>
      );
    }

    // For the team page, manually add role protection if not already covered
    if (location.pathname === '/team' && !requiredRoles) {
      return (
        <RoleBasedRoute requiredRoles={['manager_pro', 'manager_pro_gold', 'manager_pro_platinum', 'beta_user', 'system_admin']}>
          {Component}
        </RoleBasedRoute>
      );
    }

    return Component;
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
