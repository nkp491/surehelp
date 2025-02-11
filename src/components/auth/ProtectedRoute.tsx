
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean | null;
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({ 
  isAuthenticated, 
  children, 
  redirectTo = "/auth" 
}: ProtectedRouteProps) => {
  const location = useLocation();
  
  if (!isAuthenticated) {
    return <Navigate 
      to={`${redirectTo}?returnUrl=${encodeURIComponent(location.pathname)}`} 
      replace 
    />;
  }

  return <>{children}</>;
};
