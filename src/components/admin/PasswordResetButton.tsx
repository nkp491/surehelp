
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface PasswordResetButtonProps {
  email: string | null;
  disabled?: boolean;
}

export function PasswordResetButton({ email, disabled = false }: PasswordResetButtonProps) {
  const [isResetting, setIsResetting] = useState(false);
  const { toast } = useToast();

  const handleResetPassword = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "No email address available for this user",
        variant: "destructive",
      });
      return;
    }

    setIsResetting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `Password reset email sent to ${email}`,
      });
    } catch (error: any) {
      console.error("Error sending password reset email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to send password reset email",
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <Button
      onClick={handleResetPassword}
      disabled={isResetting || disabled || !email}
      variant="outline"
      size="sm"
      className="gap-1"
    >
      {isResetting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Sending...
        </>
      ) : (
        <>
          <KeyRound className="h-4 w-4" />
          Reset Password
        </>
      )}
    </Button>
  );
}
