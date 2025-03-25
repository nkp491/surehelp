
import { FC, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import AdminActionsPage from '@/components/admin/AdminActionsPage';
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { hasSystemAdminRole as checkSystemAdminRoleDirectly } from "@/utils/roles/hasRole";

const AdminActions: FC = () => {
  const { hasSystemAdminRole, isLoadingRoles, refetchRoles } = useRoleCheck();
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);
  const [directAccessCheck, setDirectAccessCheck] = useState<boolean | null>(null);
  const [isDirectlyChecking, setIsDirectlyChecking] = useState(true);

  // Force refetch roles to ensure we have the latest data
  useEffect(() => {
    console.log("AdminActions initial render, starting refetch");
    refetchRoles();
    
    // Also perform a direct check outside of the hook for verification
    const checkDirectly = async () => {
      setIsDirectlyChecking(true);
      try {
        const hasAdmin = await checkSystemAdminRoleDirectly();
        console.log("Direct admin role check result:", hasAdmin);
        setDirectAccessCheck(hasAdmin);
      } catch (error) {
        console.error("Error in direct admin check:", error);
      } finally {
        setIsDirectlyChecking(false);
      }
    };
    
    checkDirectly();
  }, [refetchRoles]);

  useEffect(() => {
    if (!isLoadingRoles) {
      setAccessChecked(true);
      console.log("Admin access check complete:", {
        hasSystemAdminRole,
        directAccessCheck,
        isLoadingRoles
      });
      
      // Display toast when admin page is loaded successfully for system admins
      if (hasSystemAdminRole) {
        toast({
          title: "Admin Access Granted",
          description: "You have access to the Admin Actions page",
          duration: 3000,
        });
      }
      
      try {
        const pageVisits = JSON.parse(localStorage.getItem('page-visits') || '{}');
        pageVisits['admin-actions'] = {
          timestamp: new Date().toISOString(),
          hasSystemAdminRole,
          directAccessCheck
        };
        localStorage.setItem('page-visits', JSON.stringify(pageVisits));
      } catch (e) {
        console.error('Error tracking page visit:', e);
      }
    }
  }, [isLoadingRoles, hasSystemAdminRole, directAccessCheck]);

  console.log('AdminActions page state:', { 
    isLoadingRoles, 
    accessChecked, 
    hasSystemAdminRole,
    directAccessCheck,
    isDirectlyChecking
  });

  if (isLoadingRoles || !accessChecked || isDirectlyChecking) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Checking permissions...</span>
        </div>
      </div>
    );
  }
  
  // Grant access if either check passes - this provides fallback
  const hasAccess = hasSystemAdminRole || directAccessCheck;
  
  if (!hasAccess) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need the system_admin role to access Admin Actions. Please contact an administrator for appropriate permissions.
          </AlertDescription>
        </Alert>
        <button 
          onClick={() => {
            refetchRoles();
            setAccessChecked(false);
            setIsDirectlyChecking(true);
            checkSystemAdminRoleDirectly().then(result => {
              setDirectAccessCheck(result);
              setIsDirectlyChecking(false);
            });
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 mr-4"
        >
          Retry Permission Check
        </button>
        <button 
          onClick={() => navigate("/metrics")}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return <AdminActionsPage />;
};

export default AdminActions;
