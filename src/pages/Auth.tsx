
import { useState } from "react";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthFormContainer from "@/components/auth/AuthFormContainer";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthStateHandler from "@/components/auth/AuthStateHandler";
import AuthForm from "@/components/auth/AuthForm";

const Auth = () => {
  const [errorMessage, setErrorMessage] = useState("");
  const [view, setView] = useState<"sign_in" | "sign_up" | "update_password">("sign_up");
  const [isInitializing, setIsInitializing] = useState(true);

  if (isInitializing) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
    </div>;
  }

  return (
    <AuthLayout>
      <AuthStateHandler 
        setErrorMessage={setErrorMessage}
        setView={setView}
        setIsInitializing={setIsInitializing}
      />
      
      <div className="space-y-6">
        <AuthHeader view={view} onViewChange={setView} />
        
        <AuthFormContainer>
          <AuthForm 
            view={view} 
            errorMessage={errorMessage} 
          />
        </AuthFormContainer>
      </div>
    </AuthLayout>
  );
};

export default Auth;
