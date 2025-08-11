import { memo, useCallback, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatRoleName } from "@/components/role-management/roleUtils";

interface RolesListFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: string | undefined;
  onRoleChange: (value: string) => void;
  availableRoles: string[];
}

export const RolesListFilters = memo(function RolesListFilters({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  availableRoles
}: RolesListFiltersProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  // Debounce the search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(localSearchQuery);
    }, 150); // 150ms delay

    return () => clearTimeout(timer);
  }, [localSearchQuery, onSearchChange]);

  // Sync local state with prop when it changes externally
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Memoize the search change handler
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalSearchQuery(e.target.value);
  }, []);

  // Memoize the role change handler
  const handleRoleChange = useCallback((value: string) => {
    onRoleChange(value);
  }, [onRoleChange]);

  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <Input
        placeholder="Search by name or email"
        value={localSearchQuery}
        onChange={handleSearchChange}
        className="md:w-1/3"
      />
      
      <div className="flex flex-1 items-end space-x-2">
        <Select value={selectedRole} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Select role to assign" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map(role => (
              <SelectItem key={role} value={role}>
                {formatRoleName(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
});
