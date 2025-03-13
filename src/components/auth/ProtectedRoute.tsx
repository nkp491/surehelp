
import { Navigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
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
  const [isVerifying, setIsVerifying] = useState(true);
  const [sessionValid, setSessionValid] = useState<boolean | null>(null);
  
  useEffect(() => {
    const verifySession = async () => {
      if (isAuthenticated) {
        try {
          // Verify the session is valid on the server
          const { data, error } = await supabase.functions.invoke('verify-session');
          
          if (error) {
            console.error("Session verification error:", error);
            setSessionValid(false);
          } else {
            setSessionValid(!!data);
          }
        } catch (err) {
          console.error("Session verification error:", err);
          setSessionValid(false);
        }
      } else {
        setSessionValid(false);
      }
      setIsVerifying(false);
    };
    
    verifySession();
  }, [isAuthenticated]);
  
  // Show loading state while verifying
  if (isVerifying || isAuthenticated === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // Redirect if not authenticated or session is invalid
  if (!isAuthenticated || sessionValid === false) {
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
