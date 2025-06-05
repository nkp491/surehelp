import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "Please enter a valid email address";
    }
    const validTLDs = [".com", ".net", ".org", ".edu", ".gov", ".io", ".co", ".uk", ".ca", ".au"];
    const hasValidTLD = validTLDs.some((tld) => email.toLowerCase().endsWith(tld));
    if (!hasValidTLD) {
      return "Please enter an email with a valid domain";
    }
    if (email.length < 5) {
      return "Email address is too short";
    }
    if (email.length > 254) {
      return "Email address is too long";
    }
    return "";
  };

  const isEmailValid = () => {
    return validateEmail(email) === "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const siteUrl = window.location.origin;
      const redirectUrl = `${siteUrl}/auth/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });
      if (error) {
        throw error;
      }
      setEmailSent(true);
      setEmail("");
    } catch (error) {
      console.error("Error sending password reset email:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendEmail = () => {
    setEmailSent(false);
  };

  if (emailSent) {
    return (
      <AuthLayout>
        <div className="container mx-auto py-8 px-4 max-w-md">
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
                  className="text-sm text-[#2A6F97] hover:text-[#2A6F97]/90 block w-full"
                >
                  Back to Login
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div className="container mx-auto py-8 px-4 max-w-md">
        <Card>
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
                  className="text-sm text-gray-600 hover:text-gray-800"
                  disabled={loading}
                >
                  Back to Login
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;
