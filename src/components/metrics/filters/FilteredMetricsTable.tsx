import {MetricCount} from "@/types/metrics";
import MetricsTable from "../MetricsTable";
import {format, startOfDay} from "date-fns";

interface FilteredMetricsTableProps {
  history: Array<{ date: string; metrics: MetricCount }>;
  editingRow: string | null;
  editedValues: MetricCount | null;
  onEdit: (date: string, metrics: MetricCount) => void;
  onSave: (date: string) => void;
  onCancel: () => void;
  onValueChange: (metric: keyof MetricCount, value: string) => void;
  onDelete: (date: string) => void;
  selectedDate?: Date;
}

const FilteredMetricsTable = ({
  history,
  editingRow,
  editedValues,
  onEdit,
  onSave,
  onCancel,
  onValueChange,
  onDelete,
  selectedDate,
}: FilteredMetricsTableProps) => {
  const filteredHistory = history.filter((entry) => {
      return !selectedDate ||
        format(startOfDay(new Date(entry.date)), "yyyy-MM-dd") ===
        format(startOfDay(selectedDate), "yyyy-MM-dd");
  });

  return (
    <div className="bg-white">
      <MetricsTable
        history={filteredHistory}
        editingRow={editingRow}
        editedValues={editedValues}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        onValueChange={onValueChange}
        onDelete={onDelete}
      />
    </div>
  );
};

export default FilteredMetricsTable;
