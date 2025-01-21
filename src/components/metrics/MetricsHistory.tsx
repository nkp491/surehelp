import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import { useState } from 'react';
import DeleteMetricDialog from './DeleteMetricDialog';
import MetricsHistoryHeader from './filters/MetricsHistoryHeader';
import FilteredMetricsTable from './filters/FilteredMetricsTable';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';

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

  const [deleteDate, setDeleteDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  return (
    <div className="space-y-4">
      <MetricsHistoryHeader
        selectedDate={selectedDate}
        onDateSelect={setSelectedDate}
        onAdd={handleAddBackdatedMetrics}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
      />
      
      <FilteredMetricsTable
        history={sortedHistory}
        editingRow={editingRow}
        editedValues={editedValues}
        onEdit={handleEdit}
        onSave={handleSave}
        onCancel={handleCancel}
        onSort={handleSort}
        onValueChange={handleValueChange}
        onDelete={(date) => setDeleteDate(date)}
        searchTerm={searchTerm}
        dateRange={dateRange}
      />

      <DeleteMetricDialog
        isOpen={!!deleteDate}
        onOpenChange={(open) => !open && setDeleteDate(null)}
        onConfirm={() => deleteDate && handleDelete(deleteDate)}
      />
    </div>
  );
};

export default MetricsHistory;