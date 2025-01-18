import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import AddMetricsButton from './AddMetricsButton';
import MetricsTable from './MetricsTable';
import { useEffect } from 'react';

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
    loadHistory,
  } = useMetricsHistory();

  useEffect(() => {
    // Listen for refresh events
    const handleRefresh = () => {
      loadHistory();
    };

    window.addEventListener('refreshMetricsHistory', handleRefresh);
    return () => {
      window.removeEventListener('refreshMetricsHistory', handleRefresh);
    };
  }, [loadHistory]);

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