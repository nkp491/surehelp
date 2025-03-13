
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  assignRoleToUser, 
  hasSystemAdminRole, 
  removeRoleFromUser, 
  getUserRoles,
  bulkRoleOperation 
} from "@/utils/roleAssignment";
import { useToast } from "@/hooks/use-toast";
import { Loader2, AlertTriangle, Search, UserCheck, UserPlus, UserMinus, Users } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AdminActions() {
  const [userId, setUserId] = useState("c65f14e1-81d4-46f3-9183-22e935936d0e");
  const [role, setRole] = useState("manager_pro_platinum");
  const [isLoading, setIsLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [isCheckingAdmin, setIsCheckingAdmin] = useState(true);
  const [action, setAction] = useState<"assign" | "remove">("assign");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<{
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null>(null);
  const { toast } = useToast();
  
  // Bulk operations state
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<"assign" | "remove">("assign");
  const [bulkRole, setBulkRole] = useState("manager_pro_platinum");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Get users data from the hook
  const { users, isLoadingUsers, availableRoles } = useRoleManagement();

  // Toggle "Select All" users
  const handleSelectAll = () => {
    setSelectAll(!selectAll);
    if (!selectAll) {
      setSelectedUserIds(users?.map(user => user.id) || []);
    } else {
      setSelectedUserIds([]);
    }
  };

  // Toggle individual user selection
  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  useEffect(() => {
    const checkAdminRole = async () => {
      setIsCheckingAdmin(true);
      const result = await hasSystemAdminRole();
      setIsAdmin(result);
      setIsCheckingAdmin(false);
    };
    checkAdminRole();
  }, []);

  const handleRoleAction = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid user ID",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      if (action === "assign") {
        result = await assignRoleToUser(userId, role);
      } else {
        result = await removeRoleFromUser(userId, role);
      }
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        // Refresh roles display if we're looking at the same user
        if (userInfo) {
          handleLookupRoles();
        }
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookupRoles = async () => {
    if (!userId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid user ID",
        variant: "destructive",
      });
      return;
    }

    setIsLookingUp(true);
    setUserRoles([]);
    setUserInfo(null);
    
    try {
      const result = await getUserRoles(userId);
      
      if (result.success) {
        setUserRoles(result.roles || []);
        setUserInfo({
          email: result.email || null,
          firstName: result.firstName || null,
          lastName: result.lastName || null
        });
        
        toast({
          title: "Success",
          description: result.message,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLookingUp(false);
    }
  };
  
  // Handle bulk role operations
  const handleBulkRoleOperation = async () => {
    if (selectedUserIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one user",
        variant: "destructive",
      });
      return;
    }

    setIsBulkLoading(true);
    try {
      const result = await bulkRoleOperation(selectedUserIds, bulkRole, bulkAction);
      
      if (result.success) {
        toast({
          title: "Bulk Operation Completed",
          description: result.message,
        });
        
        // Optionally show detailed results in console
        console.log("Bulk operation results:", result.results);
        
        // Reset selection after operation
        setSelectedUserIds([]);
        setSelectAll(false);
      } else {
        toast({
          title: "Bulk Operation Failed",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsBulkLoading(false);
    }
  };

  // Format role display name
  const formatRoleName = (role: string) => {
    if (role === "beta_user") return "Beta User";
    if (role === "manager_pro_gold") return "Manager Pro Gold";
    if (role === "manager_pro_platinum") return "Manager Pro Platinum";
    if (role === "agent_pro") return "Agent Pro";
    if (role === "manager_pro") return "Manager Pro";
    if (role === "system_admin") return "System Admin";
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  // Get badge variant based on role
  const getBadgeVariant = (role: string) => {
    switch (role) {
      case "manager_pro_platinum": return "outline";
      case "manager_pro_gold": return "outline"; 
      case "agent_pro": return "outline";
      case "manager_pro": return "default";
      case "beta_user": return "destructive";
      case "system_admin": return "outline";
      default: return "secondary";
    }
  };

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
            <Card className="max-w-2xl mx-auto">
              <CardHeader>
                <CardTitle>Manage User Roles</CardTitle>
                <CardDescription>
                  Assign, remove, or look up roles for specific users using their ID
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="userId">
                    User ID
                  </label>
                  <Input
                    id="userId"
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="Enter user ID"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The user must exist in the profiles table for the role management to work
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleLookupRoles}
                    disabled={isLookingUp || !userId.trim()}
                    variant="outline"
                    className="w-full"
                  >
                    {isLookingUp ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Looking Up...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Look Up User Roles
                      </>
                    )}
                  </Button>
                </div>
                
                {userInfo && (
                  <div className="mt-4 bg-muted/50 p-4 rounded-md">
                    <div className="flex items-center mb-2">
                      <UserCheck className="h-5 w-5 mr-2 text-primary" />
                      <h3 className="font-medium">
                        {userInfo.firstName || ''} {userInfo.lastName || ''}
                        {!userInfo.firstName && !userInfo.lastName && 'User'}
                      </h3>
                    </div>
                    {userInfo.email && (
                      <p className="text-sm text-muted-foreground mb-3">{userInfo.email}</p>
                    )}
                    
                    <div className="mt-2">
                      <h4 className="text-sm font-medium mb-2">Current Roles:</h4>
                      {userRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {userRoles.map((userRole, index) => (
                            <Badge 
                              key={index}
                              variant={getBadgeVariant(userRole)} 
                              className={`text-sm ${
                                userRole === "manager_pro_gold" 
                                  ? "border-yellow-500 text-yellow-700 bg-yellow-50" 
                                  : userRole === "manager_pro_platinum" 
                                    ? "border-purple-500 text-purple-700 bg-purple-50" 
                                    : userRole === "agent_pro"
                                      ? "border-blue-500 text-blue-700 bg-blue-50"
                                      : userRole === "system_admin"
                                        ? "border-red-500 text-red-700 bg-red-50"
                                        : ""
                              }`}
                            >
                              {formatRoleName(userRole)}
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No roles assigned</p>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="border-t pt-4 mt-4">
                  <h3 className="font-medium mb-3">Assign or Remove Roles</h3>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1" htmlFor="action">
                      Action
                    </label>
                    <Select value={action} onValueChange={(value: "assign" | "remove") => setAction(value)}>
                      <SelectTrigger id="action">
                        <SelectValue placeholder="Select action" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="assign">Assign Role</SelectItem>
                        <SelectItem value="remove">Remove Role</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-1" htmlFor="role">
                      Role
                    </label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger id="role">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableRoles.map((r) => (
                          <SelectItem key={r} value={r}>
                            {formatRoleName(r)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <Button 
                    onClick={handleRoleAction}
                    disabled={isLoading || !userId.trim() || !role}
                    className="w-full mt-4"
                    variant={action === "remove" ? "destructive" : "default"}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {action === "assign" ? "Assigning..." : "Removing..."}
                      </>
                    ) : (
                      action === "assign" ? "Assign Role" : "Remove Role"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="bulk">
            <Card className="mx-auto">
              <CardHeader>
                <CardTitle>Bulk Role Management</CardTitle>
                <CardDescription>
                  Assign or remove roles for multiple users at once
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Action</label>
                      <Select value={bulkAction} onValueChange={(value: "assign" | "remove") => setBulkAction(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select action" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assign">
                            <div className="flex items-center">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign Role
                            </div>
                          </SelectItem>
                          <SelectItem value="remove">
                            <div className="flex items-center">
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove Role
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-sm font-medium mb-1">Role</label>
                      <Select value={bulkRole} onValueChange={setBulkRole}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableRoles.map((r) => (
                            <SelectItem key={r} value={r}>
                              {formatRoleName(r)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-medium flex items-center">
                        <Users className="h-5 w-5 mr-2" />
                        Select Users
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="selectAll" 
                          checked={selectAll} 
                          onCheckedChange={handleSelectAll} 
                        />
                        <label htmlFor="selectAll" className="text-sm cursor-pointer">
                          Select All
                        </label>
                      </div>
                    </div>
                    
                    {isLoadingUsers ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <div className="border rounded-md divide-y max-h-[400px] overflow-y-auto">
                        {users?.map(user => (
                          <div key={user.id} className="p-3 flex items-center hover:bg-muted/50">
                            <Checkbox 
                              id={`user-${user.id}`}
                              checked={selectedUserIds.includes(user.id)}
                              onCheckedChange={() => toggleUserSelection(user.id)}
                              className="mr-3"
                            />
                            <label htmlFor={`user-${user.id}`} className="flex-1 cursor-pointer">
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between w-full">
                                <div>
                                  <p className="font-medium">
                                    {user.first_name} {user.last_name}
                                    {!user.first_name && !user.last_name && 'Unknown User'}
                                  </p>
                                  <p className="text-sm text-muted-foreground">{user.email}</p>
                                </div>
                                {user.roles.length > 0 && (
                                  <div className="flex flex-wrap gap-1 mt-2 sm:mt-0">
                                    {user.roles.map((role, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {formatRoleName(role)}
                                      </Badge>
                                    ))}
                                  </div>
                                )}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <div className="text-sm text-muted-foreground mr-auto">
                      {selectedUserIds.length} user{selectedUserIds.length !== 1 ? 's' : ''} selected
                    </div>
                    <Button 
                      onClick={handleBulkRoleOperation}
                      disabled={isBulkLoading || selectedUserIds.length === 0 || !bulkRole}
                      variant={bulkAction === "remove" ? "destructive" : "default"}
                    >
                      {isBulkLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {bulkAction === "assign" ? (
                            <>
                              <UserPlus className="mr-2 h-4 w-4" />
                              Assign Role to Selected Users
                            </>
                          ) : (
                            <>
                              <UserMinus className="mr-2 h-4 w-4" />
                              Remove Role from Selected Users
                            </>
                          )}
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
