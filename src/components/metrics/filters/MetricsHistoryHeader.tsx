import AddMetricsButton from "../AddMetricsButton";
import SearchFilters from "./SearchFilters";

interface MetricsHistoryHeaderProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onAdd: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  timePeriod: "24h" | "7d" | "30d" | "custom";
  onTimePeriodChange: (period: "24h" | "7d" | "30d" | "custom") => void;
}

const MetricsHistoryHeader = ({
  selectedDate,
  onDateSelect,
  onAdd,
  searchTerm,
  onSearchChange,
  timePeriod,
  onTimePeriodChange,
}: MetricsHistoryHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
        selectedDate={selectedDate}
        onDateChange={onDateSelect}
        timePeriod={timePeriod}
        onTimePeriodChange={onTimePeriodChange}
      />
      <AddMetricsButton
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        onAdd={onAdd}
      />
    </div>
  );
};

export default MetricsHistoryHeader;