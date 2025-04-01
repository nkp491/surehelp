
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { formatRoleName } from "@/components/role-management/roleUtils";
import { Search, User } from "lucide-react";

interface RolesListFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  selectedRole: string | undefined;
  onRoleChange: (value: string | undefined) => void;
  availableRoles: string[];
  isAdmin?: boolean;
  managerFilter?: string;
  onManagerFilterChange?: (value: string) => void;
}

export function RolesListFilters({ 
  searchQuery, 
  onSearchChange, 
  selectedRole, 
  onRoleChange, 
  availableRoles,
  isAdmin = false,
  managerFilter = "",
  onManagerFilterChange = () => {}
}: RolesListFiltersProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
      <div className="flex-1 space-y-2">
        <Label htmlFor="search" className="text-sm font-medium">
          Search Users
        </Label>
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="search"
            placeholder="Search by name or email"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      
      <div className="w-full sm:w-[200px] space-y-2">
        <Label htmlFor="role-select" className="text-sm font-medium">
          Role to Assign
        </Label>
        <Select
          value={selectedRole}
          onValueChange={(value) => onRoleChange(value)}
        >
          <SelectTrigger id="role-select">
            <SelectValue placeholder="Select role" />
          </SelectTrigger>
          <SelectContent>
            {availableRoles.map((role) => (
              <SelectItem key={role} value={role}>
                {formatRoleName(role)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAdmin && (
        <div className="flex-1 space-y-2">
          <Label htmlFor="manager-filter" className="text-sm font-medium">
            Filter by Manager
          </Label>
          <div className="relative">
            <User className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="manager-filter"
              placeholder="Filter by manager name/email"
              value={managerFilter}
              onChange={(e) => onManagerFilterChange(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      )}
    </div>
  );
}
