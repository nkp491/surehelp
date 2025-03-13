
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { formatRoleName } from "@/components/role-management/roleUtils";

interface RoleActionFormProps {
  userId: string;
  availableRoles: string[];
  onRoleAction: (action: "assign" | "remove", role: string) => Promise<void>;
}

export function RoleActionForm({ userId, availableRoles, onRoleAction }: RoleActionFormProps) {
  const [role, setRole] = useState("manager_pro_platinum");
  const [action, setAction] = useState<"assign" | "remove">("assign");
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleAction = async () => {
    if (!userId.trim() || !role) {
      return;
    }

    setIsLoading(true);
    try {
      await onRoleAction(action, role);
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}
