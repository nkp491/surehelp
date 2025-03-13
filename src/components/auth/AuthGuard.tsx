
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuthState();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isVerifyingSession, setIsVerifyingSession] = useState(true);
  
  useEffect(() => {
    const verifyAuthentication = async () => {
      if (!isLoading && isAuthenticated === false) {
        navigate("/auth", { replace: true });
        setIsVerifyingSession(false);
        return;
      }
      
      if (isAuthenticated) {
        // We're authenticated, no need for additional verification
        // Removing the verify-session function call that's causing infinite redirects
        setIsVerifyingSession(false);
      } else {
        setIsVerifyingSession(false);
      }
    };
    
    verifyAuthentication();
  }, [isLoading, isAuthenticated, navigate, toast]);

  if (isLoading || isVerifyingSession) {
    return <LoadingScreen />;
  }
  
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
