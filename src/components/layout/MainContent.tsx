
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { navigationItems } from "./sidebar/navigationItems";
import AuthGuard from "@/components/auth/AuthGuard";
import { Suspense, lazy, useEffect, useState } from "react";
import LoadingSkeleton from "@/components/ui/loading-skeleton";
import { useRoleCheck } from "@/hooks/useRoleCheck";

// Lazily load all components with a small delay to improve perceived performance
const LazyDashboard = lazy(() => import("@/pages/Dashboard"));
const LazySubmittedForms = lazy(() => import("@/pages/SubmittedForms"));
const LazyManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const LazyProfile = lazy(() => import("@/pages/Profile"));
const LazyFormContainer = lazy(() => import("@/components/FormContainer"));
const LazyCommissionTracker = lazy(() => import("@/pages/CommissionTracker"));
const LazyRoleManagement = lazy(() => import("@/pages/RoleManagement"));
const LazyTeamPage = lazy(() => import("@/pages/Team"));
const LazyAdminActionsPage = lazy(() => import("@/components/admin/AdminActionsPage"));

// Mapping of paths to components
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

// Start preloading common components immediately
const preloadComponents = () => {
  // Preload the most common components first
  return Promise.all([
    import("@/pages/Profile"),
    import("@/pages/Dashboard"),
    import("@/pages/SubmittedForms")
  ]);
};

// Start preloading immediately when this module loads
preloadComponents();

const MainContent = () => {
  const location = useLocation();
  const [stablePathname, setStablePathname] = useState(location.pathname);
  const { hasSystemAdminRole } = useRoleCheck();
  
  // Find the current navigation item to get the required roles
  const currentNavItem = navigationItems.find(item => item.path === location.pathname);
  const requiredRoles = currentNavItem?.requiredRoles;

  // Update stable pathname when location changes
  useEffect(() => {
    console.log('MainContent: Location changed to', location.pathname);
    setStablePathname(location.pathname);
  }, [location.pathname]);

  // Content rendering with stable component reference
  const renderContent = () => {
    // Get the component for the stable pathname
    const StableComponent = COMPONENT_MAP[stablePathname as keyof typeof COMPONENT_MAP] || LazyDashboard;
    
    console.log('MainContent: Rendering', stablePathname, 'with roles', requiredRoles);
    
    if (hasSystemAdminRole) {
      // System admins get direct access to all pages without role checks
      return (
        <Suspense fallback={<LoadingSkeleton />}>
          <StableComponent />
        </Suspense>
      );
    }
    
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        {requiredRoles ? (
          <RoleBasedRoute requiredRoles={requiredRoles}>
            <StableComponent />
          </RoleBasedRoute>
        ) : (
          <StableComponent />
        )}
      </Suspense>
    );
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <AuthGuard>
              {renderContent()}
            </AuthGuard>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainContent;
