import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, UserCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { assignRoleToUser, removeRoleFromUser, getUserRoles } from "@/utils/roles";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { UserRolesDisplay } from "./UserRolesDisplay";
import { formatRoleName, getBadgeVariant } from "@/components/role-management/roleUtils";

export function SingleUserRoleManager() {
  const [userId, setUserId] = useState("c65f14e1-81d4-46f3-9183-22e935936d0e");
  const [role, setRole] = useState("manager_pro_platinum");
  const [isLoading, setIsLoading] = useState(false);
  const [action, setAction] = useState<"assign" | "remove">("assign");
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userInfo, setUserInfo] = useState<{
    email: string | null;
    firstName: string | null;
    lastName: string | null;
  } | null>(null);
  const { toast } = useToast();
  const { availableRoles, users } = useRoleManagement();
  const [searchQuery, setSearchQuery] = useState("");
  const [showUserSearch, setShowUserSearch] = useState(false);

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

  const filteredUsers = users?.filter(user => {
    if (!searchQuery.trim()) return false;
    
    const query = searchQuery.toLowerCase();
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    
    return fullName.includes(query) || email.includes(query);
  });

  const selectUser = (user: { id: string; first_name: string | null; last_name: string | null; email: string | null }) => {
    setUserId(user.id);
    setShowUserSearch(false);
    setUserInfo({
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name
    });
    // Also load the roles for this user
    getUserRoles(user.id).then(result => {
      if (result.success) {
        setUserRoles(result.roles || []);
      }
    });
  };

  return (
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
          <div className="flex gap-2 mb-2">
            <Input
              id="userId"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID"
            />
            <Button 
              variant="outline" 
              onClick={() => setShowUserSearch(!showUserSearch)}
              type="button"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
          
          {showUserSearch && (
            <div className="mt-2 mb-4">
              <Input
                placeholder="Search users by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-2"
              />
              
              <div className="bg-muted/50 rounded-md max-h-64 overflow-y-auto">
                {filteredUsers && filteredUsers.length > 0 ? (
                  <div className="divide-y">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => selectUser(user)}
                        className="w-full text-left p-2 hover:bg-accent hover:text-accent-foreground transition-colors"
                      >
                        <div className="font-medium">
                          {user.first_name} {user.last_name}
                          {!user.first_name && !user.last_name && 'Unknown User'}
                        </div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                        <div className="text-xs text-muted-foreground mt-1">{user.id}</div>
                      </button>
                    ))}
                  </div>
                ) : searchQuery ? (
                  <p className="p-3 text-sm text-muted-foreground">No users found</p>
                ) : (
                  <p className="p-3 text-sm text-muted-foreground">Start typing to search users</p>
                )}
              </div>
            </div>
          )}
          
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
          <UserRolesDisplay 
            userInfo={userInfo} 
            userRoles={userRoles} 
          />
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
  );
}

export const formatRoleName = (role: string) => {
  if (role === "beta_user") return "Beta User";
  if (role === "manager_pro_gold") return "Manager Pro Gold";
  if (role === "manager_pro_platinum") return "Manager Pro Platinum";
  if (role === "agent_pro") return "Agent Pro";
  if (role === "manager_pro") return "Manager Pro";
  if (role === "system_admin") return "System Admin";
  return role.charAt(0).toUpperCase() + role.slice(1);
};

export const getBadgeVariant = (role: string) => {
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
