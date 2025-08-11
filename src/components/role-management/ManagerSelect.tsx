import { useMemo, useCallback, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import { UserX, Search } from "lucide-react";

interface ManagerSelectProps {
  user: UserWithRoles;
  allUsers: UserWithRoles[];
  onAssignManager: (userId: string, managerId: string | null) => void;
}

export function ManagerSelect({
  user,
  allUsers,
  onAssignManager,
}: Readonly<ManagerSelectProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const NO_MANAGER_VALUE = "no_manager";

  const availableManagers = useMemo(() => {
    const circularUsers = new Set<string>();
    const findCircularUsers = (targetUserId: string) => {
      const visited = new Set<string>();
      const queue = [targetUserId];

      while (queue.length > 0) {
        const currentId = queue.shift();
        if (!currentId) continue;
        if (visited.has(currentId)) continue;
        visited.add(currentId);

        allUsers.forEach((potentialUser) => {
          if (
            potentialUser.manager_id === currentId &&
            !visited.has(potentialUser.id)
          ) {
            circularUsers.add(potentialUser.id);
            queue.push(potentialUser.id);
          }
        });
      }
    };
    findCircularUsers(user.id);

    return allUsers.filter(
      (potentialManager) =>
        potentialManager.id !== user.id &&
        !circularUsers.has(potentialManager.id)
    );
  }, [user.id, allUsers]);

  // Filter managers based on search query
  const filteredManagers = useMemo(() => {
    if (!searchQuery.trim()) {
      return availableManagers;
    }

    const query = searchQuery.toLowerCase().trim();
    return availableManagers.filter((manager) => {
      const firstName = (manager.first_name || "").toLowerCase();
      const lastName = (manager.last_name || "").toLowerCase();
      const email = (manager.email || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`.trim();

      return (
        firstName.indexOf(query) !== -1 ||
        lastName.indexOf(query) !== -1 ||
        email.indexOf(query) !== -1 ||
        fullName.indexOf(query) !== -1
      );
    });
  }, [availableManagers, searchQuery]);

  // Memoize the manager assignment handler
  const handleManagerChange = useCallback(
    (value: string) => {
      onAssignManager(user.id, value === NO_MANAGER_VALUE ? null : value);
    },
    [user.id, onAssignManager]
  );

  // Memoize the remove manager handler
  const handleRemoveManager = useCallback(() => {
    onAssignManager(user.id, null);
  }, [user.id, onAssignManager]);

  // Handle search input change
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  return (
    <div className="flex items-center gap-2">
      <Select
        value={user.manager_id || NO_MANAGER_VALUE}
        onValueChange={handleManagerChange}
      >
        <SelectTrigger className="w-[250px]">
          <SelectValue placeholder="Select a manager" />
        </SelectTrigger>
        <SelectContent>
          {/* Search input */}
          <div className="flex items-center px-3 py-2 border-b">
            <Search className="h-4 w-4 text-muted-foreground mr-2" />
            <Input
              placeholder="Search managers..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 p-0 h-auto"
            />
          </div>

          <SelectItem value={NO_MANAGER_VALUE}>No Manager</SelectItem>
          {filteredManagers.map((manager) => (
            <SelectItem key={manager.id} value={manager.id}>
              {manager.first_name} {manager.last_name} ({manager.email})
            </SelectItem>
          ))}
          {filteredManagers.length === 0 && searchQuery.trim() && (
            <div className="px-3 py-2 text-sm text-muted-foreground">
              No managers found matching "{searchQuery}"
            </div>
          )}
        </SelectContent>
      </Select>

      {user.manager_id && (
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemoveManager}
          className="h-8 w-8"
          title="Remove manager"
        >
          <UserX className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
