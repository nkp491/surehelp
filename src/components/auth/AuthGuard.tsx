
import { useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useRolesCache } from "@/hooks/useRolesCache";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuthState();
  const { refetchRoles } = useRolesCache();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      navigate("/auth", { replace: true });
    } else if (!isLoading && isAuthenticated === true) {
      // Ensure roles are loaded when authentication is confirmed
      refetchRoles();
    }
  }, [isLoading, isAuthenticated, navigate, refetchRoles]);

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
