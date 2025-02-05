import { useEffect, useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthHeader from "@/components/auth/AuthHeader";
import { AuthError, AuthApiError } from "@supabase/supabase-js";

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

  const getErrorMessage = (error: AuthError) => {
    if (error instanceof AuthApiError) {
      switch (error.status) {
        case 400:
          if (error.message.includes("already registered")) {
            return "This email is already registered. Please sign in instead.";
          }
          if (error.message.includes("invalid credentials")) {
            return "Invalid email or password. Please check your credentials and try again.";
          }
          break;
        case 422:
          return "Invalid email format. Please check your email and try again.";
        case 429:
          return "Too many attempts. Please try again later.";
      }
    }
    return error.message || "An unexpected error occurred. Please try again.";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white">
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[400px]">
          <AuthHeader view={view} onViewChange={setView} />

          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}

          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-md">
            <SupabaseAuth 
              supabaseClient={supabase}
              view={view}
              appearance={{ 
                theme: ThemeSupa,
                style: {
                  container: {
                    width: '100%',
                  },
                  button: {
                    width: '100%',
                    padding: '8px 16px',
                  },
                  input: {
                    width: '100%',
                    padding: '8px 12px',
                  },
                  message: {
                    width: '100%',
                  },
                  anchor: {
                    width: '100%',
                  },
                  divider: {
                    width: '100%',
                  },
                  label: {
                    width: '100%',
                    marginBottom: '4px',
                  }
                },
                variables: {
                  default: {
                    colors: {
                      brand: '#2A6F97',
                      brandAccent: '#2A6F97',
                    },
                  },
                },
                className: {
                  container: 'flex flex-col gap-4',
                  button: 'w-full',
                  input: 'w-full rounded-md',
                  message: 'w-full',
                  anchor: 'text-[#2A6F97] hover:text-[#2A6F97]/80',
                  divider: 'w-full',
                  label: 'block w-full mb-1'
                },
              }}
              providers={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;