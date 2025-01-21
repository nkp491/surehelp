import AddMetricsButton from "../AddMetricsButton";
import SearchFilters from "./SearchFilters";

interface MetricsHistoryHeaderProps {
  selectedDate: Date | undefined;
  onDateSelect: (date: Date | undefined) => void;
  onAdd: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const MetricsHistoryHeader = ({
  selectedDate,
  onDateSelect,
  onAdd,
  searchTerm,
  onSearchChange,
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
        selectedDate={selectedDate}
        onDateChange={onDateSelect}
      />
    </div>
  );
};

export default MetricsHistoryHeader;