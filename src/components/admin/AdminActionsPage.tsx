
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleUserRoleManager } from "./SingleUserRoleManager";
import { BulkUserRoleManager } from "./BulkUserRoleManager";
import { Toaster } from "@/components/ui/toaster";
import { useRoleCheck } from "@/hooks/useRoleCheck";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function AdminActionsPage() {
  const { hasSystemAdminRole, isLoadingRoles, refetchRoles } = useRoleCheck();
  const [adminChecked, setAdminChecked] = useState(false);
  
  useEffect(() => {
    console.log("AdminActionsPage loaded, hasSystemAdminRole:", hasSystemAdminRole);
    
    // Force a role check refresh when the admin page loads
    refetchRoles();
    
    // Add debugging info to localStorage for troubleshooting
    try {
      localStorage.setItem('admin-page-loaded', new Date().toISOString());
      localStorage.setItem('admin-has-role', String(hasSystemAdminRole));
    } catch (e) {
      console.error('Error setting localStorage:', e);
    }
    
    setAdminChecked(true);
  }, [hasSystemAdminRole, refetchRoles]);

  if (!adminChecked || isLoadingRoles) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
        <p>Checking permissions...</p>
      </div>
    );
  }

  if (!hasSystemAdminRole) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need system_admin role to access this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
      
      <Tabs defaultValue="single" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="single">Single User Actions</TabsTrigger>
          <TabsTrigger value="bulk">Bulk User Actions</TabsTrigger>
        </TabsList>
        
        <TabsContent value="single">
          <SingleUserRoleManager />
        </TabsContent>
        
        <TabsContent value="bulk">
          <BulkUserRoleManager />
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  );
}
