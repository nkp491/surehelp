
import { useState, useEffect } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { getAuthFormAppearance } from "@/components/auth/AuthFormAppearance";
import { getCallbackUrl } from "@/utils/authRedirectUtils";
import ClickwrapAgreement from "@/components/auth/ClickwrapAgreement";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface AuthFormProps {
  view: "sign_in" | "sign_up" | "update_password";
  errorMessage: string;
}

interface TermsAgreementData {
  accepted: boolean;
  timestamp: string;
  version: string;
}

const AuthForm = ({ view, errorMessage }: AuthFormProps) => {
  const { toast } = useToast();
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const [termsData, setTermsData] = useState<TermsAgreementData | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [localErrorMessage, setLocalErrorMessage] = useState("");

  useEffect(() => {
    // Reset error when view changes
    setLocalErrorMessage("");
  }, [view]);

  const openTermsModal = () => {
    setIsTermsModalOpen(true);
  };

  const closeTermsModal = () => {
    setIsTermsModalOpen(false);
  };

  const handleTermsAccept = (data: TermsAgreementData) => {
    setTermsData(data);
    toast({
      title: "Terms Accepted",
      description: "You have successfully agreed to the Terms and Conditions.",
      duration: 3000,
    });
  };

  const handleSignUp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!termsData?.accepted) {
      setLocalErrorMessage("You must accept the Terms and Conditions to sign up");
      return;
    }
    
    setIsLoading(true);
    setLocalErrorMessage("");
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: getCallbackUrl(),
          data: {
            terms_accepted: termsData.timestamp,
            terms_version: termsData.version
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      if (data.user) {
        toast({
          title: "Account created",
          description: "Your account has been created successfully.",
          duration: 5000,
        });
      }
    } catch (error: any) {
      console.error("Signup error:", error);
      setLocalErrorMessage(error.message || "Failed to sign up. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const renderForm = () => {
    if (view === "sign_up") {
      return (
        <form onSubmit={handleSignUp} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your.email@example.com"
              required
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="new-password"
            />
          </div>
          
          <div className="pt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full text-sm"
              onClick={openTermsModal}
            >
              {termsData?.accepted 
                ? "Terms and Conditions (Accepted)" 
                : "Read and Accept Terms and Conditions"}
            </Button>
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={!termsData?.accepted || isLoading}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>
          
          {localErrorMessage && (
            <Alert variant="destructive" className="mt-2">
              <AlertDescription>{localErrorMessage}</AlertDescription>
            </Alert>
          )}
        </form>
      );
    }
    
    // For sign_in and update_password views, use SupabaseAuth component
    return (
      <SupabaseAuth 
        supabaseClient={supabase}
        view={view}
        appearance={getAuthFormAppearance()}
        providers={[]}
        redirectTo={getCallbackUrl()}
        showLinks={true}
        onlyThirdPartyProviders={false}
        magicLink={false}
      />
    );
  };

  return (
    <>
      {errorMessage && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {renderForm()}
      
      <ClickwrapAgreement 
        isOpen={isTermsModalOpen} 
        onClose={closeTermsModal} 
        onAccept={handleTermsAccept} 
      />
    </>
  );
};

export default AuthForm;
