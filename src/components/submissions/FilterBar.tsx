import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";

interface FilterBarProps {
  filters: {
    status: string[];
    dateRange: string;
  };
  onFilterChange: (filters: any) => void;
}

const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  const statuses = ["protected", "follow-up", "declined"];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Status</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {statuses.map((status) => (
          <DropdownMenuCheckboxItem
            key={status}
            checked={filters.status.includes(status)}
            onCheckedChange={(checked) => {
              const newStatus = checked
                ? [...filters.status, status]
                : filters.status.filter((s) => s !== status);
              onFilterChange({ ...filters, status: newStatus });
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FilterBar;