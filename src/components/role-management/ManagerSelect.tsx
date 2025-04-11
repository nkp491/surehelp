import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { UserX } from "lucide-react";

interface ManagerSelectProps {
  user: UserWithRoles;
  allUsers: UserWithRoles[];
  onAssignManager: (userId: string, managerId: string | null) => void;
}

export function ManagerSelect({ user, allUsers, onAssignManager }: ManagerSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const NO_MANAGER_VALUE = "no_manager"; // Special value for no manager selection

  // Filter out the current user and their subordinates to prevent circular management chains
  const availableManagers = allUsers.filter(potentialManager => 
    potentialManager.id !== user.id && // Can't be their own manager
    !hasUserAsManager(potentialManager, user.id, allUsers) // Prevent circular references
  );

  // Helper function to check if a user has someone as their manager (direct or indirect)
  function hasUserAsManager(user: UserWithRoles, targetManagerId: string, allUsers: UserWithRoles[]): boolean {
    if (!user.manager_id) return false;
    if (user.manager_id === targetManagerId) return true;
    const manager = allUsers.find(u => u.id === user.manager_id);
    return manager ? hasUserAsManager(manager, targetManagerId, allUsers) : false;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={user.manager_id || NO_MANAGER_VALUE}
        onValueChange={(value) => {
          onAssignManager(user.id, value === NO_MANAGER_VALUE ? null : value);
        }}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a manager" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={NO_MANAGER_VALUE}>
            No Manager
          </SelectItem>
          {availableManagers.map((manager) => (
            <SelectItem key={manager.id} value={manager.id}>
              {manager.first_name} {manager.last_name} ({manager.email})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {user.manager_id && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onAssignManager(user.id, null)}
          className="h-8 w-8"
          title="Remove manager"
        >
          <UserX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
} 