import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useLocation } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import AuthHeader from "@/components/auth/AuthHeader";
import { getErrorMessage } from "@/utils/authErrors";
import { useToast } from "@/hooks/use-toast";
import TermsCheckbox from "@/components/auth/TermsCheckbox";
import { roleService } from "@/services/roleService";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState<"sign_in" | "sign_up">("sign_up");
  const [isInitializing, setIsInitializing] = useState(true);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        const hash = window.location.hash;
        if (hash?.includes("type=recovery")) {
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
              setErrorMessage(
                "You don't have any roles assigned. Please contact an administrator."
              );
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

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const { error } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (error) setErrorMessage(getErrorMessage(error));
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) setErrorMessage(getErrorMessage(error));
  };

  if (isInitializing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

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
            {view === "sign_up" && (
              <form onSubmit={handleSignUp} data-supabase-auth-view="sign_up" className="space-y-4">
                <div>
                  <label htmlFor="email">Email address</label>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password">Create a Password</label>
                  <Input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <TermsCheckbox isChecked={termsAccepted} onCheckedChange={setTermsAccepted} />
                <Button
                  type="submit"
                  className="w-full bg-[#2A6F97] hover:bg-[#256087] text-white"
                  disabled={!termsAccepted || loading}
                >
                  {loading ? "Signing up..." : "Sign up"}
                </Button>
              </form>
            )}
            {view === "sign_in" && (
              <form onSubmit={handleSignIn} data-supabase-auth-view="sign_in" className="space-y-4">
                <div>
                  <label htmlFor="email">Email address</label>
                  <Input
                    type="email"
                    placeholder="Your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password">Your Password</label>
                  <Input
                    type="password"
                    placeholder="Your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#2A6F97] hover:bg-[#256087] text-white"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign in"}
                </Button>
                <div className="mt-4 text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/auth/forgot-password")}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Forgot Password?
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
