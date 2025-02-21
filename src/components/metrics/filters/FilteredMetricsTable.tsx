import { MetricCount } from "@/types/metrics";
import MetricsTable from "../MetricsTable";
import { format } from 'date-fns';

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
  selectedDate?: Date;
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
  selectedDate,
}: FilteredMetricsTableProps) => {
  const filteredHistory = history.filter(entry => {
    const matchesSearch = !searchTerm || 
      Object.values(entry.metrics).some(value => 
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
      ) ||
      format(new Date(entry.date), 'yyyy-MM-dd').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDate = !selectedDate || 
      format(new Date(entry.date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');

    return matchesSearch && matchesDate;
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
        onSort={onSort}
        onValueChange={onValueChange}
        onDelete={onDelete}
      />
    </div>
  );
};

export default FilteredMetricsTable;