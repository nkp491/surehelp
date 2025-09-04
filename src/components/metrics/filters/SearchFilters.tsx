import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import DateRangePicker from "@/components/charts/DateRangePicker";
import { TimePeriod } from "@/types/metrics";
import { Button } from "@/components/ui/button";

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
  const handleDateRangeChange = (dates: {
    from: Date | undefined;
    to: Date | undefined;
  }) => {
    onDateChange(dates.from);
  };

  const handleClearDate = () => {
    onDateChange(null);
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
      <div className="flex items-center gap-2">
        <DateRangePicker
          timePeriod={timePeriod}
          onTimePeriodChange={onTimePeriodChange}
          onDateRangeChange={handleDateRangeChange}
        />
        {selectedDate && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClearDate}
            className="h-10 w-10 text-gray-500 hover:text-gray-700"
            title="Clear date filter"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
};

export default SearchFilters;
