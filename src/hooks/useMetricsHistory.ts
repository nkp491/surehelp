import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCount } from '@/types/metrics';
import { format } from 'date-fns';
import { useToast } from './use-toast';

export const useMetricsHistory = () => {
  const [sortedHistory, setSortedHistory] = useState<Array<{ date: string; metrics: MetricCount }>>([]);
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<MetricCount | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const { toast } = useToast();

  const loadHistory = useCallback(async () => {
    try {
      const { data: userResponse } = await supabase.auth.getUser();
      if (!userResponse.user) return;

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', userResponse.user.id)
        .order('date', { ascending: false });

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

      setSortedHistory(formattedHistory);
    } catch (error) {
      console.error('Error loading metrics history:', error);
      toast({
        title: "Error",
        description: "Failed to load metrics history",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleAddBackdatedMetrics = async () => {
    if (!selectedDate) return;

    try {
      const { data: userResponse } = await supabase.auth.getUser();
      if (!userResponse.user) return;

      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { error } = await supabase
        .from('daily_metrics')
        .upsert({
          user_id: userResponse.user.id,
          date: formattedDate,
          leads: 0,
          calls: 0,
          contacts: 0,
          scheduled: 0,
          sits: 0,
          sales: 0,
          ap: 0
        });

      if (error) throw error;

      await loadHistory();
      setSelectedDate(null);
      
      toast({
        title: "Success",
        description: "Added new metrics entry",
      });
    } catch (error) {
      console.error('Error adding backdated metrics:', error);
      toast({
        title: "Error",
        description: "Failed to add metrics entry",
        variant: "destructive",
      });
    }
  };

  const handleSort = (key: string) => {
    const newHistory = [...sortedHistory].sort((a, b) => {
      if (key === 'date') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return (b.metrics[key as keyof MetricCount] || 0) - (a.metrics[key as keyof MetricCount] || 0);
    });
    setSortedHistory(newHistory);
  };

  const handleEdit = (date: string, metrics: MetricCount) => {
    setEditingRow(date);
    setEditedValues(metrics);
  };

  const handleSave = async (date: string) => {
    if (!editedValues) return;

    try {
      const { data: userResponse } = await supabase.auth.getUser();
      if (!userResponse.user) return;

      const { error } = await supabase
        .from('daily_metrics')
        .update({
          ...editedValues,
          user_id: userResponse.user.id,
        })
        .eq('date', date)
        .eq('user_id', userResponse.user.id);

      if (error) throw error;

      await loadHistory();
      setEditingRow(null);
      setEditedValues(null);
      
      toast({
        title: "Success",
        description: "Metrics updated successfully",
      });
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
    
    const numericValue = metric === 'ap' ? parseFloat(value) : parseInt(value, 10);
    setEditedValues({
      ...editedValues,
      [metric]: isNaN(numericValue) ? 0 : numericValue
    });
  };

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
    loadHistory,
  };
};