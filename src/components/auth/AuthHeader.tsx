
import { Button } from "@/components/ui/button";

interface AuthHeaderProps {
  view: "sign_in" | "sign_up" | "update_password";
  onViewChange: (view: "sign_in" | "sign_up" | "update_password") => void;
}

const AuthHeader = ({ view, onViewChange }: AuthHeaderProps) => {
  let title = "Welcome back";
  let description = "Enter your credentials to access your account";
  
  if (view === "sign_up") {
    title = "Create an account";
    description = "Enter your details to get started";
  } else if (view === "update_password") {
    title = "Reset your password";
    description = "Enter a new secure password for your account";
  }
  
  return (
    <div className="space-y-2 text-center">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
      
      {view !== "update_password" && (
        <div className="flex justify-center gap-2 pt-2">
          <Button
            variant={view === "sign_in" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("sign_in")}
            className="min-w-24"
          >
            Sign In
          </Button>
          <Button
            variant={view === "sign_up" ? "default" : "outline"}
            size="sm"
            onClick={() => onViewChange("sign_up")}
            className="min-w-24"
          >
            Sign Up
          </Button>
        </div>
      )}
    </div>
  );
};

export default AuthHeader;
