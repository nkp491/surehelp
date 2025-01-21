import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useMetricsDelete = (loadHistory: () => void) => {
  const [deleteDate, setDeleteDate] = useState<string | null>(null);
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

  return {
    deleteDate,
    setDeleteDate,
    handleDelete,
  };
};