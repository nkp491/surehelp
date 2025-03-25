import { FC, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import AdminActionsPage from '@/components/admin/AdminActionsPage';
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";

const AdminActions: FC = () => {
  const { hasSystemAdminRole, isLoadingRoles } = useRoleCheck();
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);

  useEffect(() => {
    if (!isLoadingRoles) {
      setAccessChecked(true);
      
      try {
        const pageVisits = JSON.parse(localStorage.getItem('page-visits') || '{}');
        pageVisits['admin-actions'] = {
          timestamp: new Date().toISOString(),
          hasSystemAdminRole
        };
        localStorage.setItem('page-visits', JSON.stringify(pageVisits));
      } catch (e) {
        console.error('Error tracking page visit:', e);
      }
    }
  }, [isLoadingRoles, hasSystemAdminRole]);

  if (isLoadingRoles || !accessChecked) {
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
  
  if (!hasSystemAdminRole) {
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
