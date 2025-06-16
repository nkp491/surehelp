import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthHeader from "@/components/auth/AuthHeader";
import { getAuthFormAppearance } from "@/components/auth/AuthFormAppearance";
import { getErrorMessage } from "@/utils/authErrors";
import { useToast } from "@/hooks/use-toast";
import TermsCheckbox from "@/components/auth/TermsCheckbox";
import { roleService } from "@/services/roleService";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState<"sign_in" | "sign_up" | "update_password">("sign_up");
  const [isInitializing, setIsInitializing] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  const getSiteUrl = () => {
    try {
      if (typeof window === "undefined") {
        return "";
      }
      const currentUrl = new URL(window.location.href);
      const baseUrl = `${currentUrl.protocol}//${currentUrl.host}`;
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
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        const hash = window.location.hash;
        if (hash?.includes("type=recovery")) {
          setView("update_password");
          setIsInitializing(false);
          return;
        }
        if (session) {
          const returnUrl = new URLSearchParams(location.search).get("returnUrl");
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

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      switch (event) {
        case "SIGNED_IN":
          if (session) {
            const { hasRoles } = await roleService.fetchAndSaveRoles();
            if (!hasRoles) {
              await supabase.auth.signOut();
              setErrorMessage("You don't have any roles assigned. Please contact an administrator.");
              return;
            }
            const returnUrl = new URLSearchParams(location.search).get("returnUrl");
            navigate(returnUrl || "/assessment", { replace: true });
          }
          break;
        case "SIGNED_OUT":
          roleService.clearRoles();
          setErrorMessage("");
          break;
        case "PASSWORD_RECOVERY":
          setView("update_password");
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
  }, [navigate, toast, location]);

  useEffect(() => {
    const attachFormListeners = () => {
      const signUpForm = document.querySelector('form[data-supabase-auth-view="sign_up"]');
      if (signUpForm) {
        console.log("Attaching form submission listener to sign up form");
        signUpForm.addEventListener("submit", (e) => {
          if (!termsAccepted) {
            e.preventDefault();
            e.stopPropagation();
            setShowTermsError(true);
            return false;
          }
          setShowTermsError(false);
          return true;
        });
      }
      const signUpButton = document.querySelector(
        'form[data-supabase-auth-view="sign_up"] button[type="submit"]'
      );
      if (signUpButton && !termsAccepted) {
        signUpButton.setAttribute("disabled", !termsAccepted ? "true" : "false");
      } else if (signUpButton) {
        signUpButton.removeAttribute("disabled");
      }
    };

    const timer = setTimeout(attachFormListeners, 500);

    const observer = new MutationObserver(() => {
      attachFormListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [view, termsAccepted]);

  useEffect(() => {
    setShowTermsError(false);
  }, [view]);

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  const getCustomAppearance = () => {
    const baseAppearance = getAuthFormAppearance();
    if (view === "sign_up") {
      return {
        ...baseAppearance,
        style: {
          ...baseAppearance.style,
          button: {
            ...baseAppearance.style.button,
            opacity: termsAccepted ? "1" : "0.6",
            cursor: termsAccepted ? "pointer" : "not-allowed",
          },
        },
        className: {
          ...baseAppearance.className,
          button: `${baseAppearance.className.button} ${
            !termsAccepted ? "pointer-events-none" : ""
          }`,
        },
        variables: {
          ...baseAppearance.variables,
        },
      };
    }
    return baseAppearance;
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="space-y-6 w-[28rem]">
          <AuthHeader view={view} onViewChange={setView} />
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <div className="bg-white/90 p-6 sm:p-8 rounded-xl shadow-lg">
            <SupabaseAuth
              supabaseClient={supabase}
              appearance={getCustomAppearance()}
              providers={[]}
              redirectTo={getCallbackUrl()}
              view={view}
              showLinks={false}
            />
            {view === "sign_in" && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/auth/forgot-password");
                  }}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Forgot Password?
                </button>
              </div>
            )}
            {view === "sign_up" && (
              <TermsCheckbox
                isChecked={termsAccepted}
                onCheckedChange={setTermsAccepted}
                showError={showTermsError}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
