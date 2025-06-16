import React from 'react';
import AddMetricsButton from "../AddMetricsButton";
import SearchFilters from "./SearchFilters";
import { TimePeriod } from "@/types/metrics";

interface MetricsHistoryHeaderProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  onAdd: (date: Date) => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  timePeriod: TimePeriod;
  onTimePeriodChange: (period: TimePeriod) => void;
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
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
        <SearchFilters
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          selectedDate={selectedDate || undefined}
          onDateChange={(date) => onDateSelect(date || null)}
          timePeriod={timePeriod}
          onTimePeriodChange={onTimePeriodChange}
        />
      </div>
      <div className="flex items-center space-x-2">
        <AddMetricsButton
          selectedDate={selectedDate}
          onDateSelect={onDateSelect}
          onAdd={onAdd}
        />
      </div>
    </div>
  );
};

export default MetricsHistoryHeader;
