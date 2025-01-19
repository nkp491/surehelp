import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import AddMetricsButton from './AddMetricsButton';
import MetricsTable from './MetricsTable';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DeleteMetricDialog from './DeleteMetricDialog';

const MetricsHistory = () => {
  const { toast } = useToast();
  const [deleteDate, setDeleteDate] = useState<string | null>(null);
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

  const handleDelete = async (date: string) => {
    try {
      const { error } = await supabase
        .from('daily_metrics')
        .delete()
        .eq('date', date);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metrics record deleted successfully",
      });
      
      loadHistory();
    } catch (error) {
      console.error('Error deleting metrics:', error);
      toast({
        title: "Error",
        description: "Failed to delete metrics record",
        variant: "destructive",
      });
    }
    setDeleteDate(null);
  };

  useEffect(() => {
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
        onDelete={(date) => setDeleteDate(date)}
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