import React, { useState, useMemo, useCallback, useEffect } from "react";
import { UserWithRoles } from "@/hooks/useRoleManagement";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, UserX, Users } from "lucide-react";
import { TeamLimitIndicator } from "@/components/team/TeamLimitIndicator";
import { Badge } from "@/components/ui/badge";

interface ManagerSelectWithLimitsProps {
  user: UserWithRoles;
  allUsers: UserWithRoles[];
  onAssignManager: (userId: string, managerId: string | null) => void;
}

export function ManagerSelectWithLimits({
  user,
  allUsers,
  onAssignManager,
}: Readonly<ManagerSelectWithLimitsProps>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const NO_MANAGER_VALUE = "no_manager";

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms delay

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const canAssignManager = user.roles.some((role) =>
    [
      "agent_pro",
      "manager_pro",
      "manager_gold",
      "manager_pro_gold",
      "manager_pro_platinum",
      "beta_user",
      "system_admin",
    ].includes(role)
  );

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

    const managerRoles = [
      "manager_pro",
      "manager_gold",
      "manager_pro_gold",
      "manager_pro_platinum",
    ];
    return allUsers.filter(
      (potentialManager) =>
        potentialManager.id !== user.id &&
        !circularUsers.has(potentialManager.id) &&
        potentialManager.roles.some((role) => managerRoles.includes(role))
    );
  }, [user.id, allUsers]);

  const filteredManagers = useMemo(() => {
    if (!debouncedSearchQuery.trim()) return availableManagers;
    const query = debouncedSearchQuery.toLowerCase();
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
  }, [availableManagers, debouncedSearchQuery]);

  const handleManagerChange = useCallback(
    (value: string) => {
      if (!canAssignManager) {
        return;
      }
      try {
        onAssignManager(user.id, value === NO_MANAGER_VALUE ? null : value);
      } catch (error) {
        console.error("Error assigning manager:", error);
      }
    },
    [user.id, onAssignManager, canAssignManager]
  );

  const handleRemoveManager = useCallback(() => {
    if (!canAssignManager) {
      return;
    }
    try {
      onAssignManager(user.id, null);
    } catch (error) {
      console.error("Error removing manager:", error);
    }
  }, [user.id, onAssignManager, canAssignManager]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    },
    []
  );

  if (!canAssignManager) {
    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Select disabled>
            <SelectTrigger className="w-[250px] opacity-50">
              <SelectValue placeholder="Agent Pro required" />
            </SelectTrigger>
          </Select>
          <Button variant="ghost" size="icon" disabled className="opacity-50">
            <UserX className="h-4 w-4" />
          </Button>
        </div>
        <div className="text-xs text-muted-foreground">
          Requires Agent Pro or higher
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
                <div className="flex items-center justify-between w-full">
                  <span>
                    {manager.first_name} {manager.last_name} ({manager.email})
                  </span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {manager.roles
                      .find((role) =>
                        [
                          "manager_pro",
                          "manager_gold",
                          "manager_pro_gold",
                          "manager_pro_platinum",
                        ].includes(role)
                      )
                      ?.replace("_", " ")
                      .toUpperCase() || "MANAGER"}
                  </Badge>
                </div>
              </SelectItem>
            ))}
            {filteredManagers.length === 0 && debouncedSearchQuery.trim() && (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                No managers found matching "{debouncedSearchQuery}"
              </div>
            )}
          </SelectContent>
        </Select>
        {user.manager_id && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRemoveManager}
            title="Remove manager"
          >
            <UserX className="h-4 w-4" />
          </Button>
        )}
      </div>
      {/* Show team limits for selected manager */}
      {user.manager_id && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Manager's Team Status:</span>
          </div>
          <TeamLimitIndicator
            managerId={user.manager_id}
            showDetails={true}
            className="text-sm"
          />
        </div>
      )}
      {/* Show team limits for potential managers when searching */}
      {searchQuery.trim() && filteredManagers.length > 0 && (
        <div className="space-y-2">
          <div className="text-sm font-medium text-muted-foreground">
            Team Status for Available Managers:
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {filteredManagers.slice(0, 3).map((manager) => (
              <div key={manager.id} className="p-2 border rounded-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">
                    {manager.first_name} {manager.last_name}
                  </span>
                  <Badge variant="outline" className="text-xs">
                    {manager.roles
                      .find((role) =>
                        [
                          "manager_pro",
                          "manager_gold",
                          "manager_pro_gold",
                          "manager_pro_platinum",
                        ].includes(role)
                      )
                      ?.replace("_", " ")
                      .toUpperCase() || "MANAGER"}
                  </Badge>
                </div>
                <TeamLimitIndicator
                  managerId={manager.id}
                  showDetails={false}
                  className="text-xs"
                />
              </div>
            ))}
            {filteredManagers.length > 3 && (
              <div className="text-xs text-muted-foreground text-center py-1">
                ... and {filteredManagers.length - 3} more managers
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
