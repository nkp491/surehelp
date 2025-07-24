import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SubscriptionGuard } from "./SubscriptionGuard";

interface ConditionalSubscriptionGuardProps {
  children: React.ReactNode;
}

export const ConditionalSubscriptionGuard = ({ children }: ConditionalSubscriptionGuardProps) => {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuthStatus = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setIsLoggedIn(!!session);
    };

    checkAuthStatus();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Still loading auth state
  if (isLoggedIn === null) {
    return <>{children}</>;
  }

  // If user is logged in, apply subscription guard logic
  if (isLoggedIn) {
    return <SubscriptionGuard>{children}</SubscriptionGuard>;
  }

  // If user is not logged in, allow access to public routes
  return <>{children}</>;
};
