import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { MetricCount } from '@/types/metrics';
import { useToast } from '@/components/ui/use-toast';

type SortConfig = {
  key: string;
  direction: 'asc' | 'desc';
};

export const useMetricsHistory = () => {
  const [history, setHistory] = useState<Array<{ date: string; metrics: MetricCount }>>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<MetricCount | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'date', direction: 'desc' });
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

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

  const handleEdit = (date: string, metrics: MetricCount) => {
    setEditingRow(date);
    setEditedValues({ ...metrics });
  };

  const handleSave = async (date: string) => {
    if (!editedValues) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Convert string values to numbers and handle AP conversion
      const processedValues = Object.entries(editedValues).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: key === 'ap' ? Math.round(parseFloat(value.toString()) * 100) : parseInt(value.toString())
      }), {});

      const { error } = await supabase
        .from('daily_metrics')
        .update(processedValues)
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

    let numericValue = value === '' ? 0 : parseFloat(value);
    if (isNaN(numericValue)) return;

    setEditedValues(prev => ({
      ...prev!,
      [metric]: numericValue
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

  useEffect(() => {
    loadHistory();
  }, []);

  return {
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
  };
};