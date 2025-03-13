
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { navigationItems } from "./sidebar/navigationItems";
import AuthGuard from "@/components/auth/AuthGuard";
import { Suspense, lazy, useEffect, useState } from "react";
import LoadingSkeleton from "@/components/ui/loading-skeleton";

// Preload all common pages on app startup
const preloadComponents = () => {
  const preloads = [
    import("@/pages/Dashboard"),
    import("@/pages/SubmittedForms"),
    import("@/pages/ManagerDashboard"),
    import("@/pages/Profile"),
    import("@/components/FormContainer"),
    import("@/pages/CommissionTracker"),
    import("@/pages/RoleManagement"),
    import("@/pages/Team"),
    import("@/components/admin/AdminActionsPage")
  ];
  
  return Promise.all(preloads);
};

// Start preloading immediately
const preloadPromise = preloadComponents();

// Lazy load components with lower suspense thresholds
const LazyDashboard = lazy(() => import("@/pages/Dashboard"));
const LazySubmittedForms = lazy(() => import("@/pages/SubmittedForms"));
const LazyManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const LazyProfile = lazy(() => import("@/pages/Profile"));
const LazyFormContainer = lazy(() => import("@/components/FormContainer"));
const LazyCommissionTracker = lazy(() => import("@/pages/CommissionTracker"));
const LazyRoleManagement = lazy(() => import("@/pages/RoleManagement"));
const LazyTeamPage = lazy(() => import("@/pages/Team"));
const LazyAdminActionsPage = lazy(() => import("@/components/admin/AdminActionsPage"));

// Mapping of paths to components for better performance
const COMPONENT_MAP = {
  '/metrics': LazyDashboard,
  '/submitted-forms': LazySubmittedForms,
  '/manager-dashboard': LazyManagerDashboard,
  '/profile': LazyProfile,
  '/assessment': LazyFormContainer,
  '/commission-tracker': LazyCommissionTracker,
  '/role-management': LazyRoleManagement,
  '/team': LazyTeamPage,
  '/admin': LazyAdminActionsPage,
  '/admin-actions': LazyAdminActionsPage,
};

const MainContent = () => {
  const location = useLocation();
  const [isPreloaded, setIsPreloaded] = useState(false);

  // Wait for preload to complete
  useEffect(() => {
    preloadPromise.then(() => {
      setIsPreloaded(true);
    });
  }, []);
  
  // Find the current navigation item to get the required roles
  const currentNavItem = navigationItems.find(item => item.path === location.pathname);
  const requiredRoles = currentNavItem?.requiredRoles;

  const Component = COMPONENT_MAP[location.pathname as keyof typeof COMPONENT_MAP] || LazyDashboard;

  // Simplified content rendering with immediate fallback
  const renderContent = () => {
    return (
      <AuthGuard>
        <Suspense fallback={<LoadingSkeleton />}>
          {requiredRoles ? (
            <RoleBasedRoute requiredRoles={requiredRoles}>
              <Component />
            </RoleBasedRoute>
          ) : (
            <Component />
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
