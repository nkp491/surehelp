import { Button } from "@/components/ui/button";
import AddMetricsButton from "../AddMetricsButton";
import SearchFilters from "./SearchFilters";
import { DateRange } from "react-day-picker";

interface MetricsHistoryHeaderProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onAdd: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
}

const MetricsHistoryHeader = ({
  selectedDate,
  onDateSelect,
  onAdd,
  searchTerm,
  onSearchChange,
  dateRange,
  onDateRangeChange,
}: MetricsHistoryHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <AddMetricsButton
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        onAdd={onAdd}
      />
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        dateRange={dateRange}
        onDateRangeChange={onDateRangeChange}
      />
    </div>
  );
};

export default MetricsHistoryHeader;