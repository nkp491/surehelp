
import { useEffect, useState } from "react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { RolesList } from "@/components/role-management/RolesList";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { hasSystemAdminRole } from "@/utils/roles";

export default function RoleManagement() {
  const { 
    users, 
    isLoadingUsers, 
    availableRoles, 
    assignRole, 
    removeRole,
    isAssigningRole 
  } = useRoleManagement();
  const { language } = useLanguage();
  const t = translations[language];
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdminRole = async () => {
      setIsCheckingAdmin(true);
      const result = await hasSystemAdminRole();
      setIsAdmin(result);
      setIsCheckingAdmin(false);

      // If not admin, redirect to dashboard
      if (result === false) {
        navigate("/metrics");
      }
    };
    
    checkAdminRole();
  }, [navigate]);

  if (isCheckingAdmin) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Role Management</h1>
        <div className="flex justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Role Management</h1>
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

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Role Management</h1>
      <p className="text-muted-foreground mb-8">
        Manage user roles and permissions across the platform
      </p>

      <Tabs defaultValue="users">
        <TabsList className="mb-6">
          <TabsTrigger value="users">Users & Roles</TabsTrigger>
          <TabsTrigger value="about">About Roles</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          {isLoadingUsers ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          ) : (
            <RolesList
              users={users || []}
              availableRoles={availableRoles}
              onAssignRole={assignRole}
              onRemoveRole={removeRole}
              isAssigningRole={isAssigningRole}
            />
          )}
        </TabsContent>
        
        <TabsContent value="about">
          <Card>
            <CardHeader>
              <CardTitle>About Roles & Permissions</CardTitle>
              <CardDescription>
                Understanding the different roles and their capabilities
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Agent */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Agent</h3>
                <p className="text-muted-foreground mb-2">
                  Basic role for all insurance agents.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Access to assessment forms</li>
                  <li>Personal metrics tracking</li>
                  <li>Client book of business</li>
                </ul>
              </div>
              
              {/* Agent Pro */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Agent Pro</h3>
                <p className="text-muted-foreground mb-2">
                  Enhanced role for professional agents.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Everything in Agent role</li>
                  <li>Advanced lead tracking</li>
                  <li>Commission calculator</li>
                  <li>Performance analytics</li>
                  <li>Priority support</li>
                </ul>
              </div>
              
              {/* Manager Pro */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Manager Pro</h3>
                <p className="text-muted-foreground mb-2">
                  Entry-level role for team managers.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Everything in Agent Pro role</li>
                  <li>Basic manager dashboard</li>
                  <li>Team performance metrics</li>
                  <li>Up to 5 agent accounts</li>
                </ul>
              </div>
              
              {/* Manager Pro Gold */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Manager Pro Gold</h3>
                <p className="text-muted-foreground mb-2">
                  Mid-tier role for growing teams.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Everything in Manager Pro role</li>
                  <li>Full manager dashboard</li>
                  <li>Team performance analytics</li>
                  <li>Up to 20 agent accounts</li>
                  <li>Premium email support</li>
                  <li>White-label reporting</li>
                </ul>
              </div>
              
              {/* Manager Pro Platinum */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Manager Pro Platinum</h3>
                <p className="text-muted-foreground mb-2">
                  Top-tier role for large teams and agencies.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Everything in Manager Pro Gold role</li>
                  <li>Unlimited agent accounts</li>
                  <li>Custom API integrations</li>
                  <li>Dedicated account manager</li>
                </ul>
              </div>
              
              {/* Beta User */}
              <div className="border-b pb-4">
                <h3 className="font-semibold text-lg mb-2">Beta User</h3>
                <p className="text-muted-foreground mb-2">
                  Special role for testing new features.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Early access to new features</li>
                  <li>Feedback opportunities</li>
                  <li>Can be combined with other roles</li>
                </ul>
              </div>
              
              {/* System Admin */}
              <div>
                <h3 className="font-semibold text-lg mb-2">System Admin</h3>
                <p className="text-muted-foreground mb-2">
                  Administrative role with full system access.
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Role management</li>
                  <li>System configuration</li>
                  <li>User management</li>
                  <li>Access to all features</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
