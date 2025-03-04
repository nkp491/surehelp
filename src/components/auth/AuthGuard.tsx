
import { useAuthState } from "@/hooks/useAuthState";
import LoadingScreen from "@/components/ui/loading-screen";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated } = useAuthState();

  // Show loading screen while authentication state is being determined
  if (isLoading) {
    return <LoadingScreen />;
  }

  // Note: We no longer redirect here since this is handled in the useAuthState hook
  // This prevents navigation loops and allows the AuthGuard to be used anywhere
  
  return <>{children}</>;
};

export default AuthGuard;
