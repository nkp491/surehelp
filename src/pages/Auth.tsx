import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import { getAuthFormAppearance } from "@/components/auth/AuthFormAppearance";
import { AuthError } from "@supabase/supabase-js";
import { getErrorMessage } from "@/utils/authErrors";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_up");

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log("Initial session check:", { session, error });
      if (session) {
        navigate("/assessment");
      }
      if (error) {
        console.error("Session check error:", error);
        setErrorMessage(getErrorMessage(error));
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", { event, session });
      if (event === "SIGNED_IN" && session) {
        navigate("/assessment");
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
      if (event === "USER_UPDATED" && !session) {
        setErrorMessage("There was an error updating your account. Please try again.");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white">
      <div className="flex-1 flex items-center justify-center px-4 py-8 w-full max-w-[1440px] mx-auto">
        <div className="w-full max-w-[400px] mx-auto">
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
            />
          </AuthFormContainer>
        </div>
      </div>
    </div>
  );
};

export default Auth;