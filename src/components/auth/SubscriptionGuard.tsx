import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { roleService } from "@/services/roleService";
import LoadingScreen from "@/components/ui/loading-screen";

interface SubscriptionGuardProps {
  children: React.ReactNode;
}

export const SubscriptionGuard = ({ children }: SubscriptionGuardProps) => {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkAgentRoles = async () => {
      try {
        const { roles } = await roleService.fetchAndSaveRoles();

        // Ensure roles is a valid array
        if (!(roles.length === 1 && roles.includes("agent"))) {
          navigate("/assessment", { replace: true });
        }
      } catch (error) {
        console.error("Error checking roles:", error);
        navigate("/assessment", { replace: true });
      } finally {
        setChecking(false);
      }
    };

    checkAgentRoles();
  }, [navigate]);

  if (checking) return <LoadingScreen />;

  return <>{children}</>;
};
