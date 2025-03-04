
import { useState, useEffect } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getAuthFormAppearance } from "@/components/auth/AuthFormAppearance";
import TermsCheckbox from "@/components/auth/TermsCheckbox";
import { getCallbackUrl } from "@/utils/authRedirectUtils";

interface AuthFormProps {
  view: "sign_in" | "sign_up" | "update_password";
  errorMessage: string;
}

const AuthForm = ({ view, errorMessage }: AuthFormProps) => {
  const { toast } = useToast();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsError, setShowTermsError] = useState(false);

  const handleSignUp = async (credentials: { email: string; password: string }) => {
    if (view === "sign_up" && !termsAccepted) {
      setShowTermsError(true);
      return { error: new Error("You must accept the Terms and Conditions to sign up") };
    }
    
    setShowTermsError(false);
    
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        emailRedirectTo: getCallbackUrl(),
        data: {
          terms_accepted: termsAccepted ? new Date().toISOString() : null
        }
      }
    });
    
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
    setShowTermsError(false);
  }, [view]);

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      <SupabaseAuth 
        supabaseClient={supabase}
        view={view}
        appearance={getAuthFormAppearance()}
        providers={[]}
        redirectTo={getCallbackUrl()}
        showLinks={true}
        onlyThirdPartyProviders={false}
        magicLink={false}
        localization={{
          variables: {
            sign_up: {
              button_label: termsAccepted ? "Sign up" : "Accept Terms & Sign up"
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
    </>
  );
};

export default AuthForm;
