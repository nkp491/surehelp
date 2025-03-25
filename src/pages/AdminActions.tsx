
import { FC, useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import AdminActionsPage from '@/components/admin/AdminActionsPage';
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from '@/hooks/use-toast';
import { hasSystemAdminRole as checkSystemAdminRoleDirectly } from "@/utils/roles/hasRole";
import { supabase } from '@/integrations/supabase/client'; 

const AdminActions: FC = () => {
  const { hasSystemAdminRole, isLoadingRoles, refetchRoles } = useRoleCheck();
  const navigate = useNavigate();
  const [accessChecked, setAccessChecked] = useState(false);
  const [directAccessCheck, setDirectAccessCheck] = useState<boolean | null>(null);
  const [isDirectlyChecking, setIsDirectlyChecking] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  
  // Directly check user session and roles for debugging
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (data.session?.user) {
          setUserId(data.session.user.id);
          console.log("Current user ID:", data.session.user.id);
          
          // Directly check roles from database
          const { data: roles, error } = await supabase
            .from("user_roles")
            .select("role")
            .eq("user_id", data.session.user.id);
            
          if (error) {
            console.error("Error fetching roles:", error);
          } else {
            const roleNames = roles?.map(r => r.role) || [];
            setUserRoles(roleNames);
            console.log("Direct DB role check:", roleNames);
            
            // Check if user has system_admin role directly
            if (roleNames.includes('system_admin')) {
              // Save this for future quick checks
              try {
                localStorage.setItem('is-system-admin', 'true');
                localStorage.setItem('has-admin-access', 'true');
                sessionStorage.setItem('is-admin', 'true');
                console.log("Saved admin status to storage");
              } catch (e) {
                console.error('Error setting admin flag:', e);
              }
            }
          }
        }
      } catch (error) {
        console.error("Error checking user session:", error);
      }
    };
    
    checkUserSession();
  }, []);

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
        isLoadingRoles,
        userRoles
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
          directAccessCheck,
          userRoles
        };
        localStorage.setItem('page-visits', JSON.stringify(pageVisits));
      } catch (e) {
        console.error('Error tracking page visit:', e);
      }
    }
  }, [isLoadingRoles, hasSystemAdminRole, directAccessCheck, userRoles]);

  console.log('AdminActions page state:', { 
    isLoadingRoles, 
    accessChecked, 
    hasSystemAdminRole,
    directAccessCheck,
    isDirectlyChecking,
    userRoles,
    userId
  });

  if (isLoadingRoles || !accessChecked || isDirectlyChecking) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          <span className="ml-2 text-muted-foreground">Checking permissions...</span>
        </div>
        
        {/* Show debugging info during check */}
        <div className="mt-4 p-4 bg-muted rounded-md text-xs">
          <p>User ID: {userId || 'Checking...'}</p>
          <p>Roles from DB: {userRoles.length > 0 ? userRoles.join(', ') : 'Checking...'}</p>
          <p>System Admin (hook): {hasSystemAdminRole ? 'Yes' : 'No/Checking'}</p>
          <p>System Admin (direct): {directAccessCheck === null ? 'Checking' : (directAccessCheck ? 'Yes' : 'No')}</p>
        </div>
      </div>
    );
  }
  
  // Grant access if either check passes - this provides fallback
  const hasAccess = hasSystemAdminRole || directAccessCheck || userRoles.includes('system_admin');
  
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
        
        {/* Show debugging info */}
        <div className="mt-4 p-4 bg-muted rounded-md text-xs mb-4">
          <p>User ID: {userId || 'Unknown'}</p>
          <p>Roles from DB: {userRoles.join(', ') || 'None found'}</p>
          <p>System Admin (hook): {hasSystemAdminRole ? 'Yes' : 'No'}</p>
          <p>System Admin (direct): {directAccessCheck ? 'Yes' : 'No'}</p>
        </div>
        
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
