import { useState } from 'react';
import { format, startOfDay, addDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { MetricCount } from '@/types/metrics';

export const useMetricsBackdate = (addOptimisticEntry?: (date: string, metrics: MetricCount) => void) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

  const handleAddBackdatedMetrics = async (date: Date, onSuccess?: () => Promise<void>) => {
    if (!date) {
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

      // Adjust for timezone by adding one day and then formatting
      // This ensures the date stays the same as what the user selected
      const adjustedDate = addDays(startOfDay(date), 1);
      const formattedDate = format(adjustedDate, 'yyyy-MM-dd');

      console.log('[MetricsBackdate] Date handling:', {
        originalDate: date.toISOString(),
        adjustedDate: adjustedDate.toISOString(),
        formattedDate,
      });

      const initialMetrics: MetricCount = {
        leads: 0,
        calls: 0,
        contacts: 0,
        scheduled: 0,
        sits: 0,
        sales: 0,
        ap: 0,
      };

      // Insert the metrics directly at the top level
      const { error } = await supabase
        .from('daily_metrics')
        .insert({
          user_id: user.user.id,
          date: formattedDate,
          ...initialMetrics // Spread the metrics at the top level
        });

      if (error) {
        console.error('[MetricsBackdate] Insert error:', error);
        throw error;
      }

      // Call the optimistic update callback if provided
      if (addOptimisticEntry) {
        addOptimisticEntry(formattedDate, initialMetrics);
      }

      // Call the success callback if provided
      if (onSuccess) {
        await onSuccess();
      }

      toast({
        title: "Success",
        description: "Backdated metrics entry added",
      });

      setSelectedDate(undefined);
    } catch (error) {
      console.error('Error adding backdated metrics:', error);
      toast({
        title: "Error",
        description: "Failed to add backdated metrics",
        variant: "destructive",
      });
    }
  };

  return {
    selectedDate,
    setSelectedDate,
    handleAddBackdatedMetrics,
  };
};