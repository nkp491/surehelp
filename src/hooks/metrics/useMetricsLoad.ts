
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCount } from '@/types/metrics';
import { useToast } from '@/hooks/use-toast';

export const useMetricsLoad = () => {
  const [history, setHistory] = useState<Array<{ date: string; metrics: MetricCount }>>([]);
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

  const addOptimisticEntry = async (date: string, metrics: MetricCount) => {
    setHistory(prev => [{
      date,
      metrics
    }, ...prev]);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  return {
    history,
    loadHistory,
    addOptimisticEntry
  };
};
