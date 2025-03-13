
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RoleBasedRoute } from "@/components/auth/RoleBasedRoute";
import { navigationItems } from "./sidebar/navigationItems";
import AuthGuard from "@/components/auth/AuthGuard";
import { Suspense, lazy, useEffect, useState } from "react";
import LoadingSkeleton from "@/components/ui/loading-skeleton";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { toast } from "sonner";
import { NoAccessScreen } from "@/components/auth/NoAccessScreen";

// Lazily load all components
const LazyDashboard = lazy(() => import("@/pages/Dashboard"));
const LazySubmittedForms = lazy(() => import("@/pages/SubmittedForms"));
const LazyManagerDashboard = lazy(() => import("@/pages/ManagerDashboard"));
const LazyProfile = lazy(() => import("@/pages/Profile"));
const LazyFormContainer = lazy(() => import("@/components/FormContainer"));
const LazyCommissionTracker = lazy(() => import("@/pages/CommissionTracker"));
const LazyRoleManagement = lazy(() => import("@/pages/RoleManagement"));
const LazyTeamPage = lazy(() => import("@/pages/Team"));
const LazyAdminActionsPage = lazy(() => import("@/pages/AdminActions"));

// Eagerly preload key components
import("@/pages/Dashboard");
import("@/components/FormContainer");

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

const MainContent = () => {
  const location = useLocation();
  const { hasSystemAdminRole, isLoadingRoles, refetchRoles, userRoles } = useRoleCheck();
  const [isLoading, setIsLoading] = useState(true);
  const [componentKey, setComponentKey] = useState(Date.now()); // Force remount when needed
  
  // Check if user has any roles at all
  const hasAnyRoles = Array.isArray(userRoles) && userRoles.length > 0;
  
  // Find the current navigation item to get the required roles
  const currentNavItem = navigationItems.find(item => item.path === location.pathname);
  const requiredRoles = currentNavItem?.requiredRoles;
  
  // Reset loading state on route change and trigger loading state
  useEffect(() => {
    console.log('MainContent: Location changed to', location.pathname);
    setIsLoading(true);
    
    // Short timeout to allow component to render loading state
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 200);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  // Force a re-check of roles for admin routes
  useEffect(() => {
    const isAdminRoute = location.pathname === '/admin' || 
                         location.pathname === '/admin-actions' || 
                         location.pathname === '/role-management';
    
    if (isAdminRoute) {
      console.log("Admin route detected, verifying roles");
      refetchRoles();
      
      // Force remount of component if we're on an admin route
      setComponentKey(Date.now());
    }
  }, [location.pathname, refetchRoles]);

  // Content rendering with proper loading states
  const renderContent = () => {
    // Show loading skeleton during initial loading
    if (isLoading && isLoadingRoles) {
      return <LoadingSkeleton />;
    }
    
    // If user has no roles at all and we're done loading roles, show no access screen
    if (!isLoadingRoles && !hasAnyRoles && userRoles !== undefined) {
      return <NoAccessScreen />;
    }
    
    // Get the component for the current path
    const Component = COMPONENT_MAP[location.pathname as keyof typeof COMPONENT_MAP];
    
    if (!Component) {
      console.error(`No component found for path: ${location.pathname}`);
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Page not found</h2>
          <p className="text-muted-foreground">The page you're looking for doesn't exist or has been moved.</p>
        </div>
      );
    }
    
    // Check if the current route is an admin route
    const isAdminRoute = location.pathname === '/admin' || 
                         location.pathname === '/admin-actions' || 
                         location.pathname === '/role-management';
    
    // For admin routes, we need to be extra careful
    if (isAdminRoute) {
      // If localStorage indicates admin but hasSystemAdminRole hasn't loaded yet
      const localStorageAdmin = localStorage.getItem('is-system-admin') === 'true';
      
      if (localStorageAdmin || hasSystemAdminRole) {
        return (
          <Suspense fallback={<LoadingSkeleton />}>
            <Component key={componentKey} />
          </Suspense>
        );
      }
      
      // Still checking admin status
      if (isLoadingRoles) {
        return <LoadingSkeleton />;
      }
      
      // Not an admin, redirect
      toast.error("You don't have permission to access this page");
      return (
        <div className="p-8 text-center">
          <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
          <p className="text-muted-foreground">You don't have permission to access this page.</p>
        </div>
      );
    }
    
    // System admins get direct access to all pages without role checks
    if (hasSystemAdminRole) {
      return (
        <Suspense fallback={<LoadingSkeleton />}>
          <Component key={componentKey} />
        </Suspense>
      );
    }
    
    // For regular users, check role-based access
    return (
      <Suspense fallback={<LoadingSkeleton />}>
        {requiredRoles ? (
          <RoleBasedRoute requiredRoles={requiredRoles}>
            <Component key={componentKey} />
          </RoleBasedRoute>
        ) : (
          <Component key={componentKey} />
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
