import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { DateRange } from "react-day-picker";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
}

const SearchFilters = ({
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: SearchFiltersProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
      <div className="relative w-full sm:w-64">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search metrics..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8"
        />
      </div>
      <DatePickerWithRange
        date={dateRange}
        onDateChange={onDateRangeChange}
      />
    </div>
  );
};

export default SearchFilters;