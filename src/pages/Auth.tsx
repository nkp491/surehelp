import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import AuthLayout from "@/components/auth/AuthLayout";
import { getAuthFormAppearance } from "@/components/auth/AuthFormAppearance";
import { getErrorMessage } from "@/utils/authErrors";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState<"sign_in" | "sign_up" | "update_password">("sign_up");
  const [isInitializing, setIsInitializing] = useState(true);

  const getSiteUrl = () => {
    try {
      if (typeof window === 'undefined') {
        return '';
      }

      const currentUrl = new URL(window.location.href);
      const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
      console.log("Base URL detected:", baseUrl);
      return baseUrl;
    } catch (error) {
      console.error("Error getting site URL:", error);
      return window.location.origin;
    }
  };

  const getCallbackUrl = () => {
    try {
      const siteUrl = getSiteUrl();
      const callbackUrl = `${siteUrl}/auth/callback`;
      console.log("Callback URL configured as:", callbackUrl);
      return callbackUrl;
    } catch (error) {
      console.error("Error constructing callback URL:", error);
      return `${window.location.origin}/auth/callback`;
    }
  };

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
    const errorDescription = url.searchParams.get("error_description");
    
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
  }, [navigate, toast, location]);

  if (isInitializing) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <AuthLayout>
      <div className="space-y-6">
        <AuthHeader view={view} onViewChange={setView} />
        
        {errorMessage && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <AuthFormContainer>
          <SupabaseAuth 
            supabaseClient={supabase}
            view={view}
            appearance={getAuthFormAppearance()}
            providers={[]}
            redirectTo={getCallbackUrl()}
            showLinks={true}
          />
        </AuthFormContainer>
      </div>
    </AuthLayout>
  );
};

export default Auth;
