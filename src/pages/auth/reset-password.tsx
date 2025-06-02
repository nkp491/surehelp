import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import AuthLayout from "@/components/auth/AuthLayout";

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        // Check if there's an error in the URL hash
        const hash = location.hash.substring(1);
        const params = new URLSearchParams(hash);
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        if (error) {
          toast({
            title: "Reset Link Error",
            description: decodeURIComponent(errorDescription || error),
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
          return;
        }

        // Check if user has a valid session for password reset
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError || !session) {
          toast({
            title: "Invalid or Expired Link",
            description: "Please request a new password reset link.",
            variant: "destructive",
          });
          navigate("/auth", { replace: true });
          return;
        }

        setIsValidSession(true);
      } catch (error) {
        console.error("Error checking session:", error);
        toast({
          title: "Error",
          description: "Something went wrong. Please try again.",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkSession();
  }, [location, navigate, toast]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match.",
        variant: "destructive",
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });

      if (error) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Password Updated!",
          description:
            "Your password has been successfully updated. You can now log in with your new password.",
          variant: "default",
        });

        // Sign out the user so they can log in with new password
        await supabase.auth.signOut();
        navigate("/auth", { replace: true });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <AuthLayout>
        <div className="container mx-auto py-8 px-4 max-w-md">
          <div className="text-center">
            <div className="animate-pulse">Verifying reset link...</div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  if (!isValidSession) {
    return null; // Will redirect in useEffect
  }

  return (
    <AuthLayout>
      <div className="container mx-auto py-8 px-4 max-w-md">
        <form onSubmit={handleReset} className="space-y-4">
          <h2 className="text-2xl font-semibold text-center">Set New Password</h2>

          <Input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          <Input
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? "Updating..." : "Update Password"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;
