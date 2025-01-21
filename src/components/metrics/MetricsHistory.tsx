import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import { useState } from 'react';
import DeleteMetricDialog from './DeleteMetricDialog';
import MetricsHistoryHeader from './filters/MetricsHistoryHeader';
import FilteredMetricsTable from './filters/FilteredMetricsTable';
import { DateRange } from 'react-day-picker';
import { addDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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

  const { toast } = useToast();

  const handleDelete = async (date: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('daily_metrics')
        .delete()
        .eq('date', date)
        .eq('user_id', user.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metrics record deleted successfully",
      });

      loadHistory();
      setDeleteDate(null);
    } catch (error) {
      console.error('Error deleting metrics:', error);
      toast({
        title: "Error",
        description: "Failed to delete metrics record",
        variant: "destructive",
      });
    }
  };

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