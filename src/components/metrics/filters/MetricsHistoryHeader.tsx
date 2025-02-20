import React from 'react';
import AddMetricsButton from "../AddMetricsButton";
import SearchFilters from "./SearchFilters";

interface MetricsHistoryHeaderProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  onAdd: (date: Date) => void;
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
    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-4 w-full">
      <SearchFilters
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
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