import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DateRangePicker from "@/components/charts/DateRangePicker";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TimePeriod } from "@/types/metrics";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate?: Date;
  onDateChange: (date: Date | null) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
}

const SearchFilters = ({
  searchTerm,
  onSearchChange,
  selectedDate,
  onDateChange,
  timePeriod,
  onTimePeriodChange,
}: SearchFiltersProps) => {
  const handleDateRangeChange = (dates: { from: Date | undefined; to: Date | undefined }) => {
    // For now, we'll just use the "from" date to maintain compatibility
    onDateChange(dates.from);
  };

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
        timePeriod={timePeriod}
        onTimePeriodChange={onTimePeriodChange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
};

export default SearchFilters;
