
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { isPublicRoute } from "@/utils/routeConfig";
import { useLocation } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuthState();
  const location = useLocation();
  const currentPath = location.pathname;

  // For public routes, render children immediately without auth check
  if (isPublicRoute(currentPath)) {
    console.log("Public route accessed, skipping auth check:", currentPath);
    return <>{children}</>;
  }

  // Show loading screen while authentication state is being determined
  if (isLoading) {
    console.log("AuthGuard loading:", currentPath);
    return <LoadingScreen />;
  }
  
  // If auth check complete and on a protected route, render children
  // The useAuthState hook handles redirects for non-authenticated users
  console.log("Auth check complete, rendering protected route:", currentPath, { isAuthenticated });
  return <>{children}</>;
};

export default AuthGuard;
