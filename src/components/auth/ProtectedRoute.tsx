
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";

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
  
  // Show loading state while verifying
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated) {
    const searchParams = new URLSearchParams();
    if (location.pathname !== "/auth") {
      searchParams.set("returnUrl", location.pathname);
    }
    const redirectPath = `${redirectTo}${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
    console.log("Redirecting to:", redirectPath);
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
