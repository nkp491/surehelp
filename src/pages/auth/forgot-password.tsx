import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import AuthLayout from "@/components/auth/AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast({
        title: "Invalid Email",
        description: "Please enter a valid email address",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      // Get the current site URL dynamically
      const siteUrl = window.location.origin;
      const redirectUrl = `${siteUrl}/auth/reset-password`;

      console.log("Sending password reset to:", email);
      console.log("Redirect URL:", redirectUrl);

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        throw error;
      }

      // Show success message
      toast({
        title: "Check your email",
        description:
          "We've sent you a password reset link. Please check your email (including spam folder).",
        duration: 8000,
      });

      // Set email sent state to show confirmation
      setEmailSent(true);

      // Clear the form
      setEmail("");
    } catch (error) {
      console.error("Error sending password reset email:", error);

      // Handle specific error cases
      if (error?.message?.includes("rate limit") || error?.message?.includes("too many")) {
        toast({
          title: "Too many attempts",
          description: "Please wait a few minutes before trying again.",
          variant: "destructive",
        });
      } else if (
        error?.message?.includes("User not found") ||
        error?.message?.includes("Invalid email")
      ) {
        // For security reasons, we don't want to reveal if an email exists or not
        // So we show the same success message
        toast({
          title: "Check your email",
          description:
            "If an account with that email exists, we've sent you a password reset link.",
          duration: 8000,
        });
        setEmailSent(true);
        setEmail("");
      } else {
        toast({
          title: "Error",
          description: error?.message ?? "Failed to send password reset email. Please try again.",
          variant: "destructive",
        });
      }
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
                  className="text-sm text-blue-600 hover:text-blue-800 block w-full"
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

              <Button type="submit" className="w-full" disabled={loading || !email.trim()}>
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate("/auth")}
                  className="text-sm text-blue-600 hover:text-blue-800"
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
