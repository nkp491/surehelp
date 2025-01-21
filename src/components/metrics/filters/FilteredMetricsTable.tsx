import { MetricCount } from "@/types/metrics";
import MetricsTable from "../MetricsTable";
import { DateRange } from "react-day-picker";

interface FilteredMetricsTableProps {
  history: Array<{ date: string; metrics: MetricCount }>;
  editingRow: string | null;
  editedValues: MetricCount | null;
  onEdit: (date: string, metrics: MetricCount) => void;
  onSave: (date: string) => void;
  onCancel: () => void;
  onSort: (key: string) => void;
  onValueChange: (metric: keyof MetricCount, value: string) => void;
  onDelete: (date: string) => void;
  searchTerm: string;
  dateRange: DateRange | undefined;
}

const FilteredMetricsTable = ({
  history,
  editingRow,
  editedValues,
  onEdit,
  onSave,
  onCancel,
  onSort,
  onValueChange,
  onDelete,
  searchTerm,
  dateRange,
}: FilteredMetricsTableProps) => {
  const filteredHistory = history.filter(item => {
    const matchesSearch = Object.values(item.metrics).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) || item.date.toLowerCase().includes(searchTerm.toLowerCase());

    const itemDate = new Date(item.date);
    const isInDateRange = (!dateRange?.from || itemDate >= dateRange.from) && 
                         (!dateRange?.to || itemDate <= dateRange.to);

    return matchesSearch && isInDateRange;
  });

  return (
    <MetricsTable
      history={filteredHistory}
      editingRow={editingRow}
      editedValues={editedValues}
      onEdit={onEdit}
      onSave={onSave}
      onCancel={onCancel}
      onSort={onSort}
      onValueChange={onValueChange}
      onDelete={onDelete}
    />
  );
};

export default FilteredMetricsTable;