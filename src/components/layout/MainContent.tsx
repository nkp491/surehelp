
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { navigationItems } from "./sidebar/navigationItems";
import AuthGuard from "@/components/auth/AuthGuard";
import { Suspense, lazy, useEffect } from "react";
import LoadingScreen from "@/components/ui/loading-screen";

// Lazy load components to improve initial load performance
const LazyDashboard = lazy(() => import("@/pages/Dashboard"));
const LazySubmittedForms = lazy(() => import("@/pages/SubmittedForms"));
const LazyManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const LazyProfile = lazy(() => import("@/pages/Profile"));
const LazyFormContainer = lazy(() => import("@/components/FormContainer"));
const LazyCommissionTracker = lazy(() => import("@/pages/CommissionTracker"));
const LazyRoleManagement = lazy(() => import("@/pages/RoleManagement"));
const LazyTeamPage = lazy(() => import("@/pages/Team"));
const LazyAdminActionsPage = lazy(() => import("@/components/admin/AdminActionsPage"));

const MainContent = () => {
  const location = useLocation();

  // Debug navigation
  useEffect(() => {
    console.log('MainContent rendering for path:', location.pathname);
  }, [location.pathname]);

  // Find the current navigation item to get the required roles
  const currentNavItem = navigationItems.find(item => item.path === location.pathname);
  const requiredRoles = currentNavItem?.requiredRoles;

  useEffect(() => {
    console.log('Current navigation item:', { 
      path: location.pathname, 
      requiredRoles,
      hasRequiredRoles: !!requiredRoles 
    });
  }, [location.pathname, requiredRoles]);

  const renderContent = () => {
    console.log('Rendering content for path:', location.pathname);
    
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
          console.log('No matching route, defaulting to Dashboard');
          return <LazyDashboard />;
      }
    })();

    // First ensure user is authenticated
    // Then wrap with role protection if the path requires specific roles
    return (
      <AuthGuard>
        <Suspense fallback={<LoadingScreen message="Loading page content..." />}>
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
