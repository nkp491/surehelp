
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/utils/authErrors";
import { isPublicRoute } from "@/utils/routeConfig";

interface AuthStateHandlerProps {
  setErrorMessage: (message: string) => void;
  setView: (view: "sign_in" | "sign_up" | "update_password") => void;
  setIsInitializing: (initializing: boolean) => void;
}

const AuthStateHandler = ({ 
  setErrorMessage, 
  setView, 
  setIsInitializing 
}: AuthStateHandlerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const currentPath = location.pathname;

  useEffect(() => {
    let mounted = true;
    
    const checkSession = async () => {
      try {
        // Skip auth check if not on auth routes
        if (!currentPath.startsWith('/auth')) {
          if (mounted) setIsInitializing(false);
          return;
        }

        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Auth page session check:", { session, error });
        
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
          setView('update_password');
          if (mounted) setIsInitializing(false);
          return;
        }
        
        if (session) {
          const returnUrl = new URLSearchParams(location.search).get('returnUrl');
          navigate(returnUrl || "/assessment", { replace: true });
          return;
        }
        
        if (error) {
          console.error("Session check error:", error);
          setErrorMessage(getErrorMessage(error));
        }
        
        if (mounted) setIsInitializing(false);
      } catch (error) {
        console.error("Auth error:", error);
        if (mounted) setIsInitializing(false);
      }
    };
    
    // Only check session if we're on an auth page
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      
      console.log("Auth state change in AuthStateHandler:", { event, session, currentPath });
      
      switch (event) {
        case "SIGNED_IN":
          if (session) {
            const returnUrl = new URLSearchParams(location.search).get('returnUrl');
            navigate(returnUrl || "/assessment", { replace: true });
          }
          break;
        case "SIGNED_OUT":
          setErrorMessage("");
          // Don't redirect if already on an auth page
          break;
        case "PASSWORD_RECOVERY":
          setView('update_password');
          toast({
            title: "Password reset initiated",
            description: "Please check your email for the password reset link.",
            duration: 6000,
          });
          break;
        case "USER_UPDATED":
          if (session) {
            toast({
              title: "Password updated",
              description: "Your password has been successfully updated.",
              duration: 6000,
            });
            navigate("/assessment", { replace: true });
          } else {
            setErrorMessage("There was an error updating your account. Please try again.");
          }
          break;
      }
    });

    const url = new URL(window.location.href);
    const errorCode = url.searchParams.get("error_code");
    
    if (errorCode === "otp_expired") {
      toast({
        title: "Password Reset Link Expired",
        description: "The password reset link has expired. Please request a new one.",
        variant: "destructive",
        duration: 6000,
      });
      url.searchParams.delete("error_code");
      url.searchParams.delete("error_description");
      window.history.replaceState({}, "", url.toString());
    }

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast, location, setErrorMessage, setView, setIsInitializing, currentPath]);

  return null;
};

export default AuthStateHandler;
