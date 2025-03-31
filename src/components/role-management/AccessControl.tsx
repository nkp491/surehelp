
import { ReactNode, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useRoleCheck } from "@/hooks/useRoleCheck";

interface AccessControlProps {
  children: ReactNode;
}

export function AccessControl({ children }: AccessControlProps) {
  const navigate = useNavigate();
  const { userRoles, isLoadingRoles, refetchRoles } = useRoleCheck();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    // Ensure we have the latest roles when component mounts
    refetchRoles();
  }, [refetchRoles]);

  useEffect(() => {
    // Use the cached roles to determine admin status
    if (!isLoadingRoles) {
      console.log("Checking admin access with roles:", userRoles);
      const hasAdminRole = userRoles.includes('system_admin');
      console.log("Has admin role:", hasAdminRole);
      setIsAdmin(hasAdminRole);
      
      // If not admin, redirect to dashboard
      if (!hasAdminRole) {
        navigate("/metrics");
      }
    }
  }, [userRoles, isLoadingRoles, navigate]);

  if (isLoadingRoles) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
          <p className="text-muted-foreground">Checking permissions...</p>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need the system_admin role to access this page. Please contact an administrator for appropriate permissions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return <>{children}</>;
}
