import { useState } from 'react';
import { MetricCount } from '@/types/metrics';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMetricsEdit = () => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedValues, setEditedValues] = useState<MetricCount | null>(null);
  const { toast } = useToast();

  const handleEdit = (date: string, metrics: MetricCount) => {
    setEditingRow(date);
    setEditedValues({ ...metrics });
  };

  const handleSave = async (date: string) => {
    if (!editedValues) return;

    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Process values before saving
      const processedValues = Object.entries(editedValues).reduce((acc, [key, value]) => ({
        ...acc,
        [key]: Math.round(Number(value))
      }), {} as MetricCount);

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

    setEditedValues(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        [metric]: metric === 'ap' ? Math.round(Number(value)) : Number(value)
      };
    });
  };

  return {
    editingRow,
    editedValues,
    handleEdit,
    handleSave,
    handleCancel,
    handleValueChange,
  };
};