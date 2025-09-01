import { useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const validateEmail = useCallback((email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const validTLDs = [".com", ".net", ".org", ".edu", ".gov", ".io", ".co", ".uk", ".ca", ".au"];
    if (!emailRegex.test(email)) return "Please enter a valid email address.";
    if (!validTLDs.some((tld) => email.toLowerCase().endsWith(tld)))
      return "Please enter an email with a valid domain.";
    if (email.length < 5) return "Email address is too short.";
    if (email.length > 254) return "Email address is too long.";
    return "";
  }, []);

  const isEmailValid = useCallback(() => validateEmail(email) === "", [email, validateEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    const validationError = validateEmail(email);
    if (validationError) {
      setErrorMessage(validationError);
      setLoading(false);
      return;
    }

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const { count, error: profileError } = await supabase
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("email", normalizedEmail);

      if (profileError) throw profileError;

      if (count && count > 0) {
        const redirectUrl = `${window.location.origin}/auth/reset-password`;
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
          redirectTo: redirectUrl,
        });
        if (resetError) throw resetError;
        setEmailSent(true);
        setEmail("");
      } else {
        setErrorMessage("No account found with this email address.");
      }
    } catch (err) {
      console.error("Reset error:", err);
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
    setErrorMessage("");
  };

  if (emailSent) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white">
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <div className="space-y-6 w-[28rem]">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-semibold text-center text-green-600">
                  Email Sent!
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <div className="space-y-2">
                  <p className="text-gray-600">
                    We've sent a password reset link to your email address.
                  </p>
                  <p className="text-sm text-gray-500">
                    Please check your email (including spam folder) and click the link to reset your
                    password.
                  </p>
                </div>
                <div className="space-y-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={handleResendEmail}
                  >
                    Send Another Email
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate("/auth")}
                    className="text-sm hover:text-[#2A6F97] hover:underline block w-full"
                  >
                    Back to Login
                  </button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="space-y-6 w-[28rem] flex flex-col items-center">
          <img
            src="/lovable-uploads/cb31ac2c-4859-4fad-b7ef-36988cc1dad3.png"
            alt="Logo"
            className="h-16 object-contain mb-4"
          />
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-center">Reset Password</CardTitle>
              <p className="text-center text-gray-600 mt-2">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    disabled={loading}
                    autoComplete="email"
                  />
                  {errorMessage && <p className="text-sm text-red-600 mt-1">{errorMessage}</p>}
                </div>

                <Button
                  type="submit"
                  className="w-full px-4 py-2 bg-[#2A6F97] text-white rounded-md font-medium hover:bg-[#2A6F97]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading || !isEmailValid()}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => navigate("/auth")}
                    className="text-sm text-gray-600 hover:text-[#2A6F97] hover:underline"
                    disabled={loading}
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
