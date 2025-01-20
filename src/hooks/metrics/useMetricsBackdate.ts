import { useState } from 'react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useMetricsBackdate = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const { toast } = useToast();

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

      // First check if an entry already exists for this date
      const { data: existingEntry } = await supabase
        .from('daily_metrics')
        .select('id')
        .eq('user_id', user.user.id)
        .eq('date', formattedDate)
        .maybeSingle();

      if (existingEntry) {
        toast({
          title: "Entry Exists",
          description: "An entry already exists for this date. Please edit the existing entry instead.",
          variant: "destructive",
        });
        return;
      }

      const initialMetrics = {
        user_id: user.user.id,
        date: formattedDate,
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
        .insert(initialMetrics);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Backdated metrics entry added successfully",
      });

      setSelectedDate(undefined);
      
      // Trigger a refresh of the metrics history
      const refreshEvent = new CustomEvent('refreshMetricsHistory');
      window.dispatchEvent(refreshEvent);

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