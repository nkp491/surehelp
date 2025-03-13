
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { UserRolesDisplay } from "./UserRolesDisplay";
import { UserSearch } from "./UserSearch";
import { RoleActionForm } from "./RoleActionForm";
import { useUserRoleManager } from "@/hooks/useUserRoleManager";

export function SingleUserRoleManager() {
  const { 
    userId, 
    setUserId, 
    userInfo, 
    userRoles,
    isLookingUp, 
    handleLookupRoles, 
    handleRoleAction,
    selectUser
  } = useUserRoleManager();
  
  const { availableRoles, users } = useRoleManagement();

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
            <UserSearch 
              users={users} 
              onSelectUser={selectUser} 
            />
          </div>
          
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
        
        <RoleActionForm 
          userId={userId}
          availableRoles={availableRoles}
          onRoleAction={handleRoleAction}
        />
      </CardContent>
    </Card>
  );
}
