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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";

interface FilterBarProps {
  filters: {
    status: string[];
    dateRange: {
      from?: Date;
      to?: Date;
    };
    leadType: string[];
    premium: {
      min?: number;
      max?: number;
    };
  };
  onFilterChange: (filters: any) => void;
}

const FilterBar = ({ filters, onFilterChange }: FilterBarProps) => {
  const statuses = ["protected", "follow-up", "declined"];
  const leadTypes = [
    "Mortgage Protection",
    "Internet/Facebook",
    "Live Transfer",
    "Referral",
    "Other"
  ];

  const handleDateSelect = (date: Date | undefined, type: 'from' | 'to') => {
    onFilterChange({
      ...filters,
      dateRange: {
        ...filters.dateRange,
        [type]: date
      }
    });
  };

  const handlePremiumChange = (value: string, type: 'min' | 'max') => {
    const numValue = value === '' ? undefined : Number(value);
    onFilterChange({
      ...filters,
      premium: {
        ...filters.premium,
        [type]: numValue
      }
    });
  };

  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
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

          <DropdownMenuSeparator />
          <DropdownMenuLabel>Lead Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {leadTypes.map((type) => (
            <DropdownMenuCheckboxItem
              key={type}
              checked={filters.leadType.includes(type)}
              onCheckedChange={(checked) => {
                const newTypes = checked
                  ? [...filters.leadType, type]
                  : filters.leadType.filter((t) => t !== type);
                onFilterChange({ ...filters, leadType: newTypes });
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "justify-start text-left font-normal",
              !filters.dateRange.from && !filters.dateRange.to && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.dateRange.from ? (
              filters.dateRange.to ? (
                <>
                  {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                  {format(filters.dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(filters.dateRange.from, "LLL dd, y")
              )
            ) : (
              "Date Range"
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            selected={{
              from: filters.dateRange.from,
              to: filters.dateRange.to
            }}
            onSelect={(range) => {
              onFilterChange({
                ...filters,
                dateRange: {
                  from: range?.from,
                  to: range?.to
                }
              });
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FilterBar;
