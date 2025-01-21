import { useMetricsHistory } from '@/hooks/useMetricsHistory';
import AddMetricsButton from './AddMetricsButton';
import MetricsTable from './MetricsTable';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import DeleteMetricDialog from './DeleteMetricDialog';
import { Input } from '../ui/input';
import { Search } from 'lucide-react';
import { DatePickerWithRange } from '../ui/date-range-picker';
import { addDays } from 'date-fns';

const MetricsHistory = () => {
  const { toast } = useToast();
  const [deleteDate, setDeleteDate] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

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

  // Filter history based on search term and date range
  const filteredHistory = sortedHistory.filter(item => {
    const matchesSearch = Object.values(item.metrics).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    ) || item.date.toLowerCase().includes(searchTerm.toLowerCase());

    const itemDate = new Date(item.date);
    const isInDateRange = (!dateRange.from || itemDate >= dateRange.from) && 
                         (!dateRange.to || itemDate <= dateRange.to);

    return matchesSearch && isInDateRange;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <AddMetricsButton
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onAdd={handleAddBackdatedMetrics}
        />
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search metrics..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <DatePickerWithRange
            date={dateRange}
            onDateChange={setDateRange}
          />
        </div>
      </div>
      <MetricsTable
        history={filteredHistory}
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