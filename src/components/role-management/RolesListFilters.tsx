
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatRoleName } from "@/components/role-management/roleUtils";

interface RolesListFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: string | undefined;
  onRoleChange: (value: string) => void;
  availableRoles: string[];
}

export function RolesListFilters({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  availableRoles
}: RolesListFiltersProps) {
  return (
    <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
      <Input
        placeholder="Search by name or email"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="md:w-1/3"
      />
      
      <div className="flex flex-1 items-end space-x-2">
        <Select value={selectedRole} onValueChange={onRoleChange}>
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
}
