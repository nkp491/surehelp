
import { useState, useEffect } from "react";
import { hasSystemAdminRole } from "@/utils/roles";
import { Loader2, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SingleUserRoleManager } from "./SingleUserRoleManager";
import { BulkUserRoleManager } from "./BulkUserRoleManager";

export default function AdminActionsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      setIsCheckingAdmin(true);
      const result = await hasSystemAdminRole();
      setIsAdmin(result);
      setIsCheckingAdmin(false);
    };
    checkAdminRole();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
      
      {isCheckingAdmin ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : isAdmin === false ? (
        <Alert variant="destructive" className="mb-6">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You need the system_admin role to access these functions. Please contact an administrator to get the appropriate permissions.
          </AlertDescription>
        </Alert>
      ) : (
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
      )}
    </div>
  );
}
