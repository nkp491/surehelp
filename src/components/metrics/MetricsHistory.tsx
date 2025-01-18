import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import AddMetricsButton from './AddMetricsButton';
import MetricsTable from './MetricsTable';

const MetricsHistory = () => {
  const {
    sortedHistory,
    editingRow,
    editedValues,
    selectedDate,
    setSelectedDate,
    handleAddBackdatedMetrics,
    handleSort,
    handleEdit,
    handleSave,
    handleCancel,
    handleValueChange,
  } = useMetricsHistory();

  return (
    <div className="space-y-4">
      <AddMetricsButton
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onAdd={handleAddBackdatedMetrics}
      />
      <MetricsTable
        history={sortedHistory}
        editingRow={editingRow}
        editedValues={editedValues}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onSort={handleSort}
        onValueChange={handleValueChange}
      />
    </div>
  );
};

export default MetricsHistory;