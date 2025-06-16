import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { supabase } from "@/integrations/supabase/client";
import { Eye, EyeOff, Lock, Check, X } from "lucide-react";

interface ValidationItemProps {
  isValid: boolean;
  text: string;
}

const ValidationItem = ({ isValid, text }: ValidationItemProps) => (
  <div
    className={`flex items-center gap-2 text-sm ${isValid ? "text-green-600" : "text-gray-500"}`}
  >
    {isValid ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
    <span>{text}</span>
  </div>
);

const PasswordSettings = () => {
  const { language } = useLanguage();
  const t = translations[language];
  // Dialog states
  const [showCurrentPasswordDialog, setShowCurrentPasswordDialog] = useState(false);
  const [showNewPasswordDialog, setShowNewPasswordDialog] = useState(false);
  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // Password visibility states
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

  const verifyCurrentPassword = async (password: string): Promise<boolean> => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.email) {
        throw new Error("No user email found");
      }
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });
      return !error;
    } catch (error: unknown) {
      console.error("Error verifying password:", error);
      return false;
    }
  };

  const handleCurrentPasswordSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ): Promise<void> => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await verifyCurrentPassword(currentPassword);
      if (response) {
        setShowCurrentPasswordDialog(false);
        setShowNewPasswordDialog(true);
      } else {
        setError("Current password is incorrect");
      }
    } catch (error: unknown) {
      console.error("Error verifying password:", error);
      setError("Failed to verify password");
    } finally {
      setLoading(false);
    }
  };

  const handleNewPasswordSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    setError("");
    const { isValid } = validatePassword(newPassword);
    if (!isValid) {
      setError("Password does not meet the requirements");
      return;
    }
    if (currentPassword === newPassword) {
      setError("New password must be different from current password");
      return;
    }
    setLoading(true);
    try {
      const response = await supabase.auth.updateUser({
        password: newPassword,
      });
      if (response.error) {
        if (response.error.name === "AuthWeakPasswordError") {
          const formattedError = response?.error?.message.replace(/([A-Z])/g, " $1").trim();
          const capitalizedError = formattedError.charAt(0).toUpperCase() + formattedError.slice(1);
          setError(capitalizedError);
        } else {
          setError(response.error.message || "Failed to update password");
        }
        return;
      }
      if (!response.data?.user) {
        setError("Failed to update password. Please try again.");
        return;
      }
      handleCloseDialogs();
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialogs = (): void => {
    setShowCurrentPasswordDialog(false);
    setShowNewPasswordDialog(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setShowCurrentPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setError("");
  };

  const handleChangePasswordClick = (): void => {
    setShowCurrentPasswordDialog(true);
  };

  const { validations } = validatePassword(newPassword);

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">
            {t.securitySettings}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Lock className="h-4 w-4" />
                {t.password}
              </h3>
              <p className="text-sm text-gray-500">{t.passwordDescription}</p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleChangePasswordClick}
                className="w-fit text-[#2A6F97] hover:text-[#2A6F97]/90 border-[#2A6F97] hover:bg-[#2A6F97]/10"
              >
                <Lock className="h-4 w-4 mr-2" />
                Change Password
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Password Dialog */}
      <Dialog open={showCurrentPasswordDialog} onOpenChange={setShowCurrentPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Verify Current Password
            </DialogTitle>
            <DialogDescription>
              Please enter your current password to continue with changing your password.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleCurrentPasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  disabled={loading}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  tabIndex={-1}
                >
                  {showCurrentPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading || !currentPassword}
                className="flex-1 bg-[#2A6F97] hover:bg-[#2A6F97]/90"
              >
                {loading ? "Verifying..." : "Continue"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialogs}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* New Password Dialog */}
      <Dialog open={showNewPasswordDialog} onOpenChange={setShowNewPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Set New Password
            </DialogTitle>
            <DialogDescription>
              Create a new secure password that meets all the requirements below.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleNewPasswordSubmit} className="space-y-4">
            {/* New Password */}
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter your new password"
                  disabled={loading}
                  required
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  tabIndex={-1}
                >
                  {showNewPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  disabled={loading}
                  required
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
            {newPassword && (
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
                  newPassword === confirmPassword ? "text-green-600" : "text-red-600"
                }`}
              >
                {newPassword === confirmPassword ? (
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

            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                disabled={
                  loading ||
                  !validatePassword(newPassword).isValid ||
                  newPassword !== confirmPassword
                }
                className="flex-1 bg-[#2A6F97] hover:bg-[#2A6F97]/90"
              >
                {loading ? "Updating..." : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialogs}
                disabled={loading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PasswordSettings;
