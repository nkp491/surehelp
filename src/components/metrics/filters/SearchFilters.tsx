import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
}

const SearchFilters = ({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
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
        date={selectedDate}
        onDateChange={onDateChange}
      />
    </div>
  );
};

export default SearchFilters;