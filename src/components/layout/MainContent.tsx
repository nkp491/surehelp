
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { navigationItems } from "./sidebar/navigationItems";
import AuthGuard from "@/components/auth/AuthGuard";
import { Suspense, lazy, useEffect, useState, useTransition } from "react";
import LoadingSkeleton from "@/components/ui/loading-skeleton";

// Preload common pages on app startup
const LazyDashboard = lazy(() => {
  // Start loading Dashboard immediately
  const preload = import("@/pages/Dashboard");
  return preload;
});

// Lazy load components with dynamic imports for code splitting
const LazySubmittedForms = lazy(() => import("@/pages/SubmittedForms"));
const LazyManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const LazyProfile = lazy(() => import("@/pages/Profile"));
const LazyFormContainer = lazy(() => import("@/components/FormContainer"));
const LazyCommissionTracker = lazy(() => import("@/pages/CommissionTracker"));
const LazyRoleManagement = lazy(() => import("@/pages/RoleManagement"));
const LazyTeamPage = lazy(() => import("@/pages/Team"));
const LazyAdminActionsPage = lazy(() => import("@/components/admin/AdminActionsPage"));

// Prefetch all routes - this will trigger webpack to create separate chunks
// but begin downloading when idle
const prefetchRoutes = () => {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    // @ts-ignore - requestIdleCallback is not in the TS types
    window.requestIdleCallback(() => {
      // Prefetch all routes during idle time
      import("@/pages/SubmittedForms");
      import("@/pages/ManagerDashboard");
      import("@/pages/Profile");
      import("@/components/FormContainer");
      import("@/pages/CommissionTracker");
      import("@/pages/RoleManagement");
      import("@/pages/Team");
      import("@/components/admin/AdminActionsPage");
    });
  }
};

const MainContent = () => {
  const location = useLocation();
  const [isPending, startTransition] = useTransition();
  const [currentPath, setCurrentPath] = useState(location.pathname);
  
  // Prefetch all routes on initial load
  useEffect(() => {
    prefetchRoutes();
  }, []);

  // Use React 18 transitions for smoother page changes
  useEffect(() => {
    if (location.pathname !== currentPath) {
      startTransition(() => {
        setCurrentPath(location.pathname);
      });
    }
  }, [location.pathname, currentPath]);

  // Find the current navigation item to get the required roles
  const currentNavItem = navigationItems.find(item => item.path === location.pathname);
  const requiredRoles = currentNavItem?.requiredRoles;

  const renderContent = () => {
    // Use memoized component reference for better performance
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
        <Suspense fallback={<LoadingSkeleton />}>
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
