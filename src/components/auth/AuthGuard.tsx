
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { invalidateRolesCache } from "@/lib/auth-cache";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isInitialCheck, setIsInitialCheck] = useState(true);
  
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated === false) {
        // Invalidate role cache when logging out
        invalidateRolesCache();
        navigate("/auth", { replace: true });
      }
      setIsInitialCheck(false);
    }
  }, [isLoading, isAuthenticated, navigate, toast]);

  // Show loading only on initial check
  if (isLoading && isInitialCheck) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
