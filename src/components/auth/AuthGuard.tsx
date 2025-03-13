
import { useEffect, useState } from "react";
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
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
        try {
          // Verify the session token is valid on the server
          const { data: sessionValid, error } = await supabase.rpc('verify_session_valid');
          
          if (error || !sessionValid) {
            console.error("Session validation error:", error);
            // Force sign out if session is invalid
            await supabase.auth.signOut();
            toast({
              title: "Session Expired",
              description: "Your session has expired. Please sign in again.",
              variant: "destructive",
            });
            navigate("/auth", { replace: true });
          }
        } catch (err) {
          console.error("Session verification error:", err);
          // Force sign out on error
          await supabase.auth.signOut();
          navigate("/auth", { replace: true });
        }
      }
      
      setIsVerifyingSession(false);
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
