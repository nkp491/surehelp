import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { MetricCount } from '@/types/metrics';
import { Table, TableBody, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Plus } from 'lucide-react';
import MetricsTableHeader from './MetricsTableHeader';
import EditableMetricCell from './EditableMetricCell';
import MetricRowActions from './MetricRowActions';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

const MetricsHistory = () => {
  const [history, setHistory] = useState<Array<{ date: string; metrics: MetricCount }>>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<MetricCount | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .order('date', { ascending: false })
        .limit(10);

      if (error) throw error;

      const formattedHistory = data.map(entry => ({
        date: entry.date,
        metrics: {
          leads: entry.leads || 0,
          calls: entry.calls || 0,
          contacts: entry.contacts || 0,
          scheduled: entry.scheduled || 0,
          sits: entry.sits || 0,
          sales: entry.sales || 0,
          ap: entry.ap || 0,
        }
      }));

      setHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading metrics history:', error);
      toast({
        title: "Error",
        description: "Failed to load metrics history",
        variant: "destructive",
      });
    }
  };

  const handleAddBackdatedMetrics = async () => {
    if (!selectedDate) {
      toast({
        title: "Error",
        description: "Please select a date",
        variant: "destructive",
      });
      return;
    }

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      const initialMetrics = {
        leads: 0,
        calls: 0,
        contacts: 0,
        scheduled: 0,
        sits: 0,
        sales: 0,
        ap: 0,
      };

      const { error } = await supabase
        .from('daily_metrics')
        .insert({
          user_id: user.user.id,
          date: formattedDate,
          ...initialMetrics
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Backdated metrics entry added",
      });

      setSelectedDate(undefined);
      loadHistory();
    } catch (error) {
      console.error('Error adding backdated metrics:', error);
      toast({
        title: "Error",
        description: "Failed to add backdated metrics",
        variant: "destructive",
      });
    }
  };

  const handleSort = (key: string) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const sortedHistory = [...history].sort((a, b) => {
    if (sortConfig.key === 'date') {
      const comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    } else {
      const aValue = a.metrics[sortConfig.key as keyof MetricCount];
      const bValue = b.metrics[sortConfig.key as keyof MetricCount];
      const comparison = aValue - bValue;
      return sortConfig.direction === 'asc' ? comparison : -comparison;
    }
  });

  const handleEdit = (date: string, metrics: MetricCount) => {
    setEditingRow(date);
    setEditedValues(metrics);
  };

  const handleSave = async (date: string) => {
    if (!editedValues) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { error } = await supabase
        .from('daily_metrics')
        .update(editedValues)
        .eq('date', date)
        .eq('user_id', user.user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Metrics updated successfully",
      });

      setEditingRow(null);
      setEditedValues(null);
      loadHistory();
    } catch (error) {
      console.error('Error updating metrics:', error);
      toast({
        title: "Error",
        description: "Failed to update metrics",
        variant: "destructive",
      });
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedValues(null);
  };

  const handleValueChange = (metric: keyof MetricCount, value: string) => {
    if (!editedValues) return;

    let numericValue = parseInt(value) || 0;
    if (metric === 'ap') {
      numericValue = Math.round(parseFloat(value) * 100) || 0;
    }

    setEditedValues({
      ...editedValues,
      [metric]: numericValue
    });
  };

  const formatValue = (value: number, metric: keyof MetricCount) => {
    if (metric === 'ap') {
      return (value / 100).toFixed(2);
    }
    return value.toString();
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <CalendarIcon className="h-4 w-4" />
              Add
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="end">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              initialFocus
            />
            <div className="p-2 border-t">
              <Button 
                className="w-full"
                onClick={handleAddBackdatedMetrics}
                disabled={!selectedDate}
              >
                Add Entry
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <MetricsTableHeader onSort={handleSort} />
          <TableBody>
            {sortedHistory.map(({ date, metrics }) => (
              <TableRow key={date}>
                <EditableMetricCell
                  isEditing={false}
                  value={format(new Date(date), 'MMM dd, yyyy')}
                  onChange={() => {}}
                  metric="date"
                />
                {Object.entries(metrics).map(([metric, value]) => (
                  <EditableMetricCell
                    key={metric}
                    isEditing={editingRow === date}
                    value={formatValue(value, metric as keyof MetricCount)}
                    onChange={(newValue) => handleValueChange(metric as keyof MetricCount, newValue)}
                    metric={metric}
                  />
                ))}
                <MetricRowActions
                  isEditing={editingRow === date}
                  onEdit={() => handleEdit(date, metrics)}
                  onSave={() => handleSave(date)}
                  onCancel={handleCancel}
                />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MetricsHistory;
