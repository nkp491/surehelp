import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface RoleBasedRouteProps {
  children: ReactNode;
  requiredRoles?: string[];
  fallbackPath?: string;
}

export const RoleBasedRoute = ({
  children,
  requiredRoles,
  fallbackPath = "/auth",
}: RoleBasedRouteProps) => {
  const { hasRequiredRole } = useRoleCheck();

  if (!hasRequiredRole(requiredRoles)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};
