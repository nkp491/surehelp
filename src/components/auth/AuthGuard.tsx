import { useEffect } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { roleService } from "@/services/roleService";
import { supabase } from "@/integrations/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      if (!isLoading && isAuthenticated === false) {
        navigate("/auth", { replace: true });
        return;
      }
      if (!isLoading && isAuthenticated) {
        const { hasRoles, roles } = await roleService.fetchAndSaveRoles();
        if (!hasRoles) {
          await supabase.auth.signOut();
          navigate("/auth", { replace: true });
        }
      }
    };

    checkAuth();
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
