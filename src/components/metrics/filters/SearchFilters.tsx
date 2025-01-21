import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import DateRangePicker from "@/components/charts/DateRangePicker";

interface SearchFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedDate: Date | undefined;
  onDateChange: (date: Date | undefined) => void;
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
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
    // Update the selected date for filtering
    onDateChange(dates.from);
  };

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
      <DateRangePicker
        timePeriod={timePeriod}
        onTimePeriodChange={onTimePeriodChange}
        onDateRangeChange={handleDateRangeChange}
      />
    </div>
  );
};

export default SearchFilters;