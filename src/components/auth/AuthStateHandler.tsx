
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getErrorMessage } from "@/utils/authErrors";

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

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log("Initial session check:", { session, error });
        
        const hash = window.location.hash;
        if (hash && hash.includes('type=recovery')) {
          setView('update_password');
          setIsInitializing(false);
          return;
        }
        
        if (session) {
          const returnUrl = new URLSearchParams(location.search).get('returnUrl');
          navigate(returnUrl || "/assessment", { replace: true });
        }
        
        if (error) {
          console.error("Session check error:", error);
          setErrorMessage(getErrorMessage(error));
        }
        
        setIsInitializing(false);
      } catch (error) {
        console.error("Auth error:", error);
        setIsInitializing(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state change:", { event, session });
      
      switch (event) {
        case "SIGNED_IN":
          if (session) {
            const returnUrl = new URLSearchParams(location.search).get('returnUrl');
            navigate(returnUrl || "/assessment", { replace: true });
          }
          break;
        case "SIGNED_OUT":
          setErrorMessage("");
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

    return () => subscription.unsubscribe();
  }, [navigate, toast, location, setErrorMessage, setView, setIsInitializing]);

  return null;
};

export default AuthStateHandler;
