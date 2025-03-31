
import { useEffect, useState, useCallback } from "react";
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
import TermsCheckbox from "@/components/auth/TermsCheckbox";
import { queryClient } from "@/lib/react-query";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState<"sign_in" | "sign_up" | "update_password">("sign_up");
  const [isInitializing, setIsInitializing] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleFormSubmit = useCallback(async (event: Event) => {
    try {
      const form = event.target as HTMLFormElement;
      
      if (view !== "sign_up") return;
      
      if (!termsAccepted) {
        event.preventDefault();
        event.stopPropagation();
        setShowTermsError(true);
        setIsSubmitting(false);
        return false;
      }
      
      setShowTermsError(false);
      return true;
    } catch (error) {
      console.error("Form intercept error:", error);
      return true;
    }
  }, [view, termsAccepted]);

  const handleSignUp = async (credentials: { email: string; password: string }) => {
    setIsSubmitting(true);
    
    if (view === "sign_up" && !termsAccepted) {
      setShowTermsError(true);
      setIsSubmitting(false);
      return { error: new Error("You must accept the Terms and Conditions to sign up") };
    }
    
    setShowTermsError(false);
    
    const termsAcceptedTimestamp = termsAccepted ? new Date().toISOString() : null;
    console.log("Terms accepted timestamp:", termsAcceptedTimestamp);
    
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: getCallbackUrl(),
        data: {
          terms_accepted: termsAcceptedTimestamp
        }
      }
    });
    
    setIsSubmitting(false);
    
    if (!error && data.user) {
      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
        duration: 5000,
      });
    }
    
    return { data, error };
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
          // Pre-fetch user roles before navigation to ensure they're in cache
          await queryClient.prefetchQuery({
            queryKey: ['user-roles'],
            queryFn: async () => {
              try {
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return [];
                
                const { data: userRoles } = await supabase
                  .from('user_roles')
                  .select('role')
                  .eq('user_id', user.id);
                  
                return userRoles?.map(r => r.role) || [];
              } catch (error) {
                console.error("Error pre-fetching user roles:", error);
                return [];
              }
            }
          });

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
            // Pre-fetch user roles on sign in to ensure they're in cache
            await queryClient.prefetchQuery({
              queryKey: ['user-roles'],
              queryFn: async () => {
                try {
                  if (!session.user) return [];
                  
                  const { data: userRoles } = await supabase
                    .from('user_roles')
                    .select('role')
                    .eq('user_id', session.user.id);
                    
                  return userRoles?.map(r => r.role) || [];
                } catch (error) {
                  console.error("Error pre-fetching user roles:", error);
                  return [];
                }
              }
            });

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

  useEffect(() => {
    const attachFormListeners = () => {
      const signUpForm = document.querySelector('form[data-supabase-auth-view="sign_up"]');
      if (signUpForm) {
        console.log("Attaching form submission listener to sign up form");
        signUpForm.addEventListener('submit', (e) => {
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
      
      // Find and modify the sign up button
      const signUpButton = document.querySelector('form[data-supabase-auth-view="sign_up"] button[type="submit"]');
      if (signUpButton && !termsAccepted) {
        signUpButton.setAttribute('disabled', !termsAccepted ? 'true' : 'false');
      } else if (signUpButton) {
        signUpButton.removeAttribute('disabled');
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
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
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
            opacity: termsAccepted ? '1' : '0.6',
            cursor: termsAccepted ? 'pointer' : 'not-allowed',
          }
        },
        className: {
          ...baseAppearance.className,
          button: `${baseAppearance.className.button} ${!termsAccepted ? 'pointer-events-none' : ''}`
        },
        variables: {
          ...baseAppearance.variables,
        }
      };
    }
    
    return baseAppearance;
  };

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
            appearance={getCustomAppearance()}
            providers={[]}
            redirectTo={getCallbackUrl()}
            showLinks={true}
            localization={{
              variables: {
                sign_up: {
                  button_label: "Sign up"
                }
              }
            }}
          />
          
          {view === "sign_up" && (
            <>
              <TermsCheckbox 
                isChecked={termsAccepted} 
                onCheckedChange={setTermsAccepted} 
              />
              
              {showTermsError && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>
                    You must accept the Terms and Conditions to sign up
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}
        </AuthFormContainer>
      </div>
    </AuthLayout>
  );
};

export default Auth;
