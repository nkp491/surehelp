import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import type { AuthError } from "@supabase/supabase-js";

const Auth = () => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

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

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", { event, session });
      if (event === "SIGNED_IN" && session) {
        navigate("/assessment");
      }
      if (event === "SIGNED_OUT") {
        setErrorMessage("");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getErrorMessage = (error: AuthError) => {
    console.error("Auth error:", error);
    switch (error.message) {
      case "Invalid login credentials":
        return "Invalid email or password. Please check your credentials and try again.";
      case "Email not confirmed":
        return "Please verify your email address before signing in.";
      case "Invalid Refresh Token: Refresh Token Not Found":
        return "Your session has expired. Please sign in again.";
      default:
        return `Authentication error: ${error.message}`;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png" 
            alt="Logo" 
            className="h-16 object-contain mb-8"
          />
          <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
          <p className="text-lg text-gray-600">Please sign in to your account</p>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-md">
          <SupabaseAuth 
            supabaseClient={supabase}
            appearance={{ 
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: '#2A6F97',
                    brandAccent: '#2A6F97',
                  },
                },
              },
            }}
            providers={[]}
          />
        </div>
      </div>
    </div>
  );
};

export default Auth;