import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Check, X } from "lucide-react";

interface ValidationItemProps {
  isValid: boolean;
  text: string;
}

const ValidationItem = ({ isValid, text }: ValidationItemProps): JSX.Element => (
  <div
    className={`flex items-center gap-2 text-sm ${isValid ? "text-green-600" : "text-gray-500"}`}
  >
    {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    <span>{text}</span>
  </div>
);

const ResetPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);
  const [checking, setChecking] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password validation function
  const validatePassword = (password: string) => {
    const validations = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    } as const;

    const isValid = Object.values(validations).every(Boolean);
    return { validations, isValid };
  };

  const { validations } = validatePassword(password);

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

    const { isValid } = validatePassword(password);
    if (!isValid) {
      toast({
        title: "Error",
        description: "Password does not meet the requirements",
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
        throw error;
      }

      toast({
        title: "Password Updated!",
        description:
          "Your password has been successfully updated. You can now log in with your new password.",
      });

      await supabase.auth.signOut();
      navigate("/auth", { replace: true });
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
      <div className="min-h-screen w-full bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white">
        <div className="min-h-screen w-full flex items-center justify-center p-4">
          <div className="space-y-6 w-[28rem] shadow-xl">
            <div className="text-center">
              <div className="animate-pulse">Verifying reset link...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isValidSession) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#e6e9f0] via-[#eef1f5] to-white">
      <div className="min-h-screen w-full flex items-center justify-center p-4">
        <div className="space-y-6 w-[28rem] shadow-xl">
          <form onSubmit={handleReset} className="space-y-4">
            <h2 className="text-2xl font-semibold text-center">Set New Password</h2>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                New Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                  disabled={loading}
                  minLength={8}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
            </div>

            {/* Password Requirements */}
            {password && (
              <div className="space-y-2 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm font-medium text-gray-700">Password Requirements:</div>
                <div className="space-y-1">
                  <ValidationItem isValid={validations.length} text="At least 8 characters long" />
                  <ValidationItem
                    isValid={validations.uppercase}
                    text="One uppercase letter (A-Z)"
                  />
                  <ValidationItem
                    isValid={validations.lowercase}
                    text="One lowercase letter (a-z)"
                  />
                  <ValidationItem isValid={validations.number} text="One number (0-9)" />
                  <ValidationItem
                    isValid={validations.special}
                    text="One special character (!@#$%^&*)"
                  />
                </div>
              </div>
            )}

            {/* Password Match Indicator */}
            {confirmPassword && (
              <div
                className={`text-sm ${
                  password === confirmPassword ? "text-green-600" : "text-red-600"
                }`}
              >
                {password === confirmPassword ? (
                  <div className="flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Passwords match
                  </div>
                ) : (
                  <div className="flex items-center gap-1">
                    <X className="h-3 w-3" />
                    Passwords do not match
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full px-4 py-2 bg-[#2A6F97] text-white rounded-md font-medium hover:bg-[#2A6F97]/90 transition-colors"
              disabled={
                loading || !validatePassword(password).isValid || password !== confirmPassword
              }
            >
              {loading ? "Updating..." : "Reset Password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
