
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2, UserPlus, UserMinus, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { bulkRoleOperation } from "@/utils/roles";
import { useRoleManagement } from "@/hooks/useRoleManagement";
import { UserCheckboxList } from "./UserCheckboxList";
import { formatRoleName } from "./SingleUserRoleManager";

export function BulkUserRoleManager() {
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  const [bulkAction, setBulkAction] = useState<"assign" | "remove">("assign");
  const [bulkRole, setBulkRole] = useState("manager_pro_platinum");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  
  const { toast } = useToast();
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

  return (
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
            
            <UserCheckboxList 
              users={users} 
              isLoadingUsers={isLoadingUsers}
              selectedUserIds={selectedUserIds}
              toggleUserSelection={toggleUserSelection}
            />
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
  );
}
