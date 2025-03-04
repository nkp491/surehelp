
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

  // If the route is public, render children regardless of auth state
  if (isPublicRoute(currentPath)) {
    return <>{children}</>;
  }

  // Show loading screen while authentication state is being determined
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  // We now rely on the useAuthState hook to handle redirects
  // for non-public routes where the user is not authenticated
  return <>{children}</>;
};

export default AuthGuard;
