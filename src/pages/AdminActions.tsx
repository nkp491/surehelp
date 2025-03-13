
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assignRoleToUser } from "@/utils/roleAssignment";
import { useToast } from "@/hooks/use-toast";

export default function AdminActions() {
  const [userId, setUserId] = useState("c65f14e1-81d4-46f3-9183-22e935936d0e");
  const [role, setRole] = useState("manager_pro_platinum");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const availableRoles = [
    "agent",
    "agent_pro",
    "manager_pro", 
    "manager_pro_gold",
    "manager_pro_platinum",
    "beta_user"
  ];

  const handleAssignRole = async () => {
    setIsLoading(true);
    try {
      const result = await assignRoleToUser(userId, role);
      
      if (result.success) {
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
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Admin Actions</h1>
      
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Assign Role to User</CardTitle>
          <CardDescription>
            Apply a role to a specific user using their ID
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
          </div>
          
          <div>
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
                    {r.charAt(0).toUpperCase() + r.slice(1).replace(/_/g, ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            onClick={handleAssignRole}
            disabled={isLoading || !userId.trim() || !role}
            className="w-full"
          >
            {isLoading ? "Assigning..." : "Assign Role"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
