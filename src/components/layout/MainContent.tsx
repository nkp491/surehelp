
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
import AuthGuard from "@/components/auth/AuthGuard";
import { Suspense, lazy } from "react";
import LoadingScreen from "@/components/ui/loading-screen";

// Lazy load components to improve initial load performance
const LazyDashboard = lazy(() => import("@/pages/Dashboard"));
const LazySubmittedForms = lazy(() => import("@/pages/SubmittedForms"));
const LazyManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const LazyProfile = lazy(() => import("@/pages/Profile"));
const LazyFormContainer = lazy(() => Promise.resolve({ default: FormContainer }));
const LazyCommissionTracker = lazy(() => import("@/pages/CommissionTracker"));
const LazyRoleManagement = lazy(() => import("@/pages/RoleManagement"));
const LazyTeamPage = lazy(() => import("@/pages/Team"));
const LazyAdminActionsPage = lazy(() => Promise.resolve({ default: AdminActionsPage }));

const MainContent = () => {
  const location = useLocation();

  // Find the current navigation item to get the required roles
  const currentNavItem = navigationItems.find(item => item.path === location.pathname);
  const requiredRoles = currentNavItem?.requiredRoles;

  const renderContent = () => {
    const Component = (() => {
      switch (location.pathname) {
        case '/metrics':
          return <LazyDashboard />;
        case '/submitted-forms':
          return <LazySubmittedForms />;
        case '/manager-dashboard':
          return <LazyManagerDashboard />;
        case '/profile':
          return <LazyProfile />;
        case '/assessment':
          return <LazyFormContainer />;
        case '/commission-tracker':
          return <LazyCommissionTracker />;
        case '/role-management':
          return <LazyRoleManagement />;
        case '/team':
          return <LazyTeamPage />;
        case '/admin':
        case '/admin-actions':
          return <LazyAdminActionsPage />;
        default:
          return <LazyDashboard />;
      }
    })();

    // First ensure user is authenticated
    // Then wrap with role protection if the path requires specific roles
    return (
      <AuthGuard>
        <Suspense fallback={<LoadingScreen />}>
          {requiredRoles ? (
            <RoleBasedRoute requiredRoles={requiredRoles}>
              {Component}
            </RoleBasedRoute>
          ) : (
            Component
          )}
        </Suspense>
      </AuthGuard>
    );
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
