
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { hasSystemAdminRole } from "@/utils/roles";
import { Loader2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { SingleUserRoleManager } from "./SingleUserRoleManager";
import { BulkUserRoleManager } from "./BulkUserRoleManager";

export default function AdminActionsPage() {
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const navigate = useNavigate();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Admin Actions</h1>
        <Button 
          variant="outline" 
          size="sm" 
          className="mt-2 sm:mt-0 flex items-center gap-1"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Main Page
        </Button>
      </div>
      
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
