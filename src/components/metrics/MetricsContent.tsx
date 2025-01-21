import { MetricCount } from "@/types/metrics";
import FilteredMetricsTable from './filters/FilteredMetricsTable';
import DeleteMetricDialog from './DeleteMetricDialog';

interface MetricsContentProps {
  sortedHistory: Array<{ date: string; metrics: MetricCount }>;
  editingRow: string | null;
  editedValues: MetricCount | null;
  selectedDate: Date | undefined;
  searchTerm: string;
  deleteDate: string | null;
  onEdit: (date: string, metrics: MetricCount) => void;
  onSave: (date: string) => void;
  onCancel: () => void;
  onSort: (key: string) => void;
  onValueChange: (metric: keyof MetricCount, value: string) => void;
  onDelete: (date: string) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onConfirmDelete: () => void;
}

const MetricsContent = ({
  sortedHistory,
  editingRow,
  editedValues,
  selectedDate,
  searchTerm,
  deleteDate,
  onEdit,
  onSave,
  onCancel,
  onSort,
  onValueChange,
  onDelete,
  onDeleteDialogChange,
  onConfirmDelete,
}: MetricsContentProps) => {
  return (
    <>
      <FilteredMetricsTable
        history={sortedHistory}
        editingRow={editingRow}
        editedValues={editedValues}
        onEdit={onEdit}
        onSave={onSave}
        onCancel={onCancel}
        onSort={onSort}
        onValueChange={onValueChange}
        onDelete={onDelete}
        searchTerm={searchTerm}
        selectedDate={selectedDate}
      />

      <DeleteMetricDialog
        isOpen={!!deleteDate}
        onOpenChange={onDeleteDialogChange}
        onConfirm={onConfirmDelete}
      />
    </>
  );
};

export default MetricsContent;