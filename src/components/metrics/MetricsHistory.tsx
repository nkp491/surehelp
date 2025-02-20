import { useState } from 'react';
import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import { useMetricsDelete } from '@/hooks/metrics/useMetricsDelete';
import MetricsHistoryHeader from './filters/MetricsHistoryHeader';
import MetricsContent from './MetricsContent';
import { useMetrics } from '@/contexts/MetricsContext';
import { TimePeriod } from '@/types/metrics';

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

  const { refreshMetrics } = useMetrics();

  const [searchTerm, setSearchTerm] = useState('');
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24h");
  const { deleteDate, setDeleteDate, handleDelete } = useMetricsDelete(loadHistory);

  const handleSaveAndRefresh = async (date: string) => {
    await handleSave(date);
    await loadHistory();  // Refresh the history data
    await refreshMetrics(); // Refresh the current metrics
  };

  const handleAddHistoricalEntry = async (date: Date) => {
    try {
      await handleAddBackdatedMetrics(date);
      await refreshMetrics(); // Refresh the metrics after adding
    } catch (error) {
      console.error('[MetricsHistory] Error adding historical entry:', error);
    }
  };

  return (
    <div className="space-y-4">
      <MetricsHistoryHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onAdd={handleAddHistoricalEntry}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        timePeriod={timePeriod}
        onTimePeriodChange={setTimePeriod}
      />
      
      <MetricsContent
        sortedHistory={sortedHistory}
        editingRow={editingRow}
        editedValues={editedValues}
        selectedDate={selectedDate}
        searchTerm={searchTerm}
        deleteDate={deleteDate}
        onEdit={handleEdit}
        onSave={handleSaveAndRefresh}
        onCancel={handleCancel}
        onSort={handleSort}
        onValueChange={handleValueChange}
        onDelete={(date) => setDeleteDate(date)}
        onDeleteDialogChange={(open) => !open && setDeleteDate(null)}
        onConfirmDelete={() => deleteDate && handleDelete(deleteDate)}
      />
    </div>
  );
};

export default MetricsHistory;
