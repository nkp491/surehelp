import { useState } from 'react';
import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import { useMetricsDelete } from '@/hooks/metrics/useMetricsDelete';
import MetricsHistoryHeader from './filters/MetricsHistoryHeader';
import MetricsContent from './MetricsContent';

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

  const [searchTerm, setSearchTerm] = useState('');
  const { deleteDate, setDeleteDate, handleDelete } = useMetricsDelete(loadHistory);

  return (
    <div className="space-y-4">
      <MetricsHistoryHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onAdd={handleAddBackdatedMetrics}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <MetricsContent
        sortedHistory={sortedHistory}
        editingRow={editingRow}
        editedValues={editedValues}
        selectedDate={selectedDate}
        searchTerm={searchTerm}
        deleteDate={deleteDate}
        onEdit={handleEdit}
        onSave={handleSave}
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