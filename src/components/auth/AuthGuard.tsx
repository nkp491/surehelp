
import { useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!isLoading && isAuthenticated === false) {
      navigate("/auth", { replace: true });
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
