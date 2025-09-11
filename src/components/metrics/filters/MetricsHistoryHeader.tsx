import React from "react";
import AddMetricsButton from "../AddMetricsButton";

interface MetricsHistoryHeaderProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  onAdd: (date: Date) => void;
}

const MetricsHistoryHeader = ({
  selectedDate,
  onDateSelect,
  onAdd,
}: MetricsHistoryHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-4">
      <AddMetricsButton
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        onAdd={onAdd}
      />
    </div>
  );
};

export default MetricsHistoryHeader;
