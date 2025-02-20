
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DateRangePicker from "@/components/charts/DateRangePicker";
import { TimePeriod } from "@/types/metrics";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate?: Date;
  onDateChange: (date: Date | undefined) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
  timePeriod,
  onTimePeriodChange,
}) => {
  return (
    <div className="flex items-center space-x-4">
      <div className="relative">
        <Input
          type="text"
          placeholder="Search metrics..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-8 w-[200px]"
        />
        <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500" />
      </div>
      <DateRangePicker
        date={selectedDate}
        onSelect={(date) => onDateChange(date || undefined)}
      />
    </div>
  );
}

export default SearchFilters;
