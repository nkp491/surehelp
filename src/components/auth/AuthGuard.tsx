
import { useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useRolesCache } from "@/hooks/useRolesCache";
import { useAuthStore } from "@/hooks/useAuthStore";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  // Use the auth store hook instead which is compatible with router context
  const { isLoading, isAuthenticated } = useAuthStore();
  const { refetchRoles } = useRolesCache();
  const navigate = useNavigate();
  
  // Setup auth state listener (without navigation)
  useAuthState(); 
  
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
