import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  isAuthenticated: boolean | null;
  children: React.ReactNode;
  redirectTo?: string;
}

export const ProtectedRoute = ({
  isAuthenticated,
  children,
  redirectTo = "/auth",
}: ProtectedRouteProps) => {
  const location = useLocation();
  if (isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  if (!isAuthenticated) {
    const searchParams = new URLSearchParams();
    if (location.pathname !== "/auth") {
      searchParams.set("returnUrl", location.pathname);
    }
    const redirectPath =
      redirectTo +
      (searchParams.toString() ? "?" + searchParams.toString() : "");
    return <Navigate to={redirectPath} replace />;
  }
  return <>{children}</>;
};
