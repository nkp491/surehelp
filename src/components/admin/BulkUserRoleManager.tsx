import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Users } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { useUserSearch } from "@/hooks/useUserSearch";
import { Input } from "@/components/ui/input";
import { UserCheckboxList } from "./UserCheckboxList";
import { bulkRoleOperation } from "@/utils/roles";
import { BulkPasswordReset } from "./BulkPasswordReset";
import { supabase } from "@/integrations/supabase/client";


interface selectedUserData {
  userId: string;
  email: string;
}

export function BulkUserRoleManager() {
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<selectedUserData[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [subscribedUser, setSubscribedUser] = useState<any[]>([]);
  const [action, setAction] = useState<"assign" | "remove">("assign");
  const { toast } = useToast();
  const { users, isLoadingUsers, availableRoles } = useRoleManagement();
  const { searchQuery, setSearchQuery, filterUsers } = useUserSearch();
  
  const filteredUsers = filterUsers(users);

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
    setSelectedUsers(prev => {
      const user = users.find(u => u.id === userId);
      if (!user) return prev;
      if (prev.some(u => u.userId === userId)) {
        return prev.filter(u => u.userId !== userId);
      } else {
        return [...prev, { userId: user.id, email: user.email }];
      }
    });
  };

  const handleCheckSubscription = async ()=> {
    if (selectedUserIds.length === 0 || !role) {
      toast({
        title: "Error",
        description: "Please select users and a role for the operation",
        variant: "destructive",
      });
      return;
    }
    try {
      const {data: subscribedUser, error} = await supabase.from("subscriptions").select("user_id, stripe_subscription_id").eq("plan_id", role);
      if (error) {
        throw new Error(`Error checking subscription: ${error.message}`);
      }
      if (subscribedUser.length !== 0) {
        setSubscribedUser(subscribedUser);
        setOpenDialog(true);    
        // await handleBulkRoleAction();
      } else {
        await handleBulkRoleAction();
      }
      return;
    } catch (error) {
     console.error("Error checking subscription:", error); 
    }
  }

  const handleBulkRoleAction = async () => {
    if (selectedUserIds.length === 0 || !role) {
      toast({
        title: "Error",
        description: "Please select users and a role for the operation",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await bulkRoleOperation({
        userIds: selectedUserIds,
        role,
        action,
        subscribedUser
      });
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setSelectedUserIds([]);
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

  return (
    <div>
      <AlertDialog open={openDialog} onOpenChange={setOpenDialog}>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Show Dialog</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            Below users have an active subscription for the selected role. Proceeding will revoke their subscription.
            <ul>
                {selectedUsers
                  .filter(sub => subscribedUser.some(sel => sel.user_id === sub.userId))
                  .map(user => (
                    <li key={user.userId}>{user.email}</li>
                  ))}
              </ul>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleBulkRoleAction}>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    <Card>
      <CardHeader>
        <CardTitle>Bulk User Role Management</CardTitle>
        <CardDescription>
          Assign or remove roles from multiple users at once
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Search Users
          </label>
          <Input
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4"
          />
          
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium">Users ({filteredUsers?.length || 0})</h3>
            <span className="text-sm text-muted-foreground">
              {selectedUserIds.length} selected
            </span>
          </div>
          
          <UserCheckboxList
            users={filteredUsers}
            isLoadingUsers={isLoadingUsers}
            selectedUserIds={selectedUserIds}
            toggleUserSelection={toggleUserSelection}
          />
        </div>
        
        <div className="border-t pt-4 mt-4">
          <h3 className="font-medium mb-3">
            <Users className="h-4 w-4 inline mr-1" />
            Bulk Actions for Selected Users
          </h3>
          
          <div className="grid grid-cols-1 gap-4 mb-4">
            <div className="border rounded-md p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Password Reset</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Send password reset emails to selected users
              </p>
              <BulkPasswordReset 
                selectedUserIds={selectedUserIds}
                users={users}
                disabled={isLoading}
              />
            </div>
            
            <div className="border rounded-md p-4 bg-muted/30">
              <h4 className="font-medium mb-2">Role Management</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="bulk-action">
                    Action
                  </label>
                  <Select value={action} onValueChange={(value: "assign" | "remove") => setAction(value)}>
                    <SelectTrigger id="bulk-action">
                      <SelectValue placeholder="Select action" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="assign">Assign Role</SelectItem>
                      <SelectItem value="remove">Remove Role</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="bulk-role">
                    Role
                  </label>
                  <Select value={role} onValueChange={setRole}>
                    <SelectTrigger id="bulk-role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map((r) => (
                        <SelectItem key={r} value={r}>
                          {r.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={action === "remove" ? handleCheckSubscription : handleBulkRoleAction}
                disabled={isLoading || selectedUserIds.length === 0 || !role}
                className="w-full"
                variant={action === "remove" ? "destructive" : "default"}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {action === "assign" ? "Assigning..." : "Removing..."}
                  </>
                ) : (
                  <>
                    {action === "assign" ? "Assign Role to" : "Remove Role from"} {selectedUserIds.length} Users
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}
