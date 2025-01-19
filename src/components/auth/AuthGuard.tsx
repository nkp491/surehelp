import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const clearAuthData = () => {
      // Clear all Supabase-related items from localStorage
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('sb-')) {
          localStorage.removeItem(key);
        }
      });
    };

    const handleAuthError = (error: any) => {
      console.error("Auth error:", error);
      if (mounted) {
        clearAuthData();
        toast({
          title: "Session Expired",
          description: "Please sign in again",
          variant: "destructive",
        });
        navigate("/auth", { replace: true });
      }
    };

    const checkAuth = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          if (mounted) {
            clearAuthData();
            navigate("/auth", { replace: true });
          }
          return;
        }

        if (mounted) {
          setIsLoading(false);
        }
      } catch (error) {
        handleAuthError(error);
      }
    };
    
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      console.log("Auth state change:", { event, session });
      
      if (event === 'SIGNED_OUT') {
        clearAuthData();
        navigate("/auth", { replace: true });
      } else if (event === 'SIGNED_IN') {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate, toast]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background/50">
        <div className="text-lg font-medium">Loading...</div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthGuard;