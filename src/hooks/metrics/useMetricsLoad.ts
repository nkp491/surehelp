import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCount } from '@/types/metrics';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO } from 'date-fns';

export const useMetricsLoad = () => {
  const [history, setHistory] = useState<Array<{ date: string; metrics: MetricCount }>>([]);
  const { toast } = useToast();

  const loadHistory = useCallback(async (retryCount = 0) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        console.log('[MetricsLoad] No user found, returning empty history');
        return [];
      }

      console.log('[MetricsLoad] Loading history for user:', user.user.id);
      
      // Add a small delay on retry attempts
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('[MetricsLoad] Error fetching data:', error);
        throw error;
      }

      console.log('[MetricsLoad] Raw data from database:', {
        count: data?.length,
        dates: data?.map(d => ({
          original: d.date,
          parsed: parseISO(d.date).toISOString(),
          formatted: format(parseISO(d.date), 'yyyy-MM-dd')
        })),
        data
      });

      const formattedHistory = data.map(entry => {
        // Ensure date is properly formatted
        const parsedDate = parseISO(entry.date);
        const formattedDate = format(parsedDate, 'yyyy-MM-dd');
        
        return {
          date: formattedDate,
          metrics: {
            leads: entry.leads || 0,
            calls: entry.calls || 0,
            contacts: entry.contacts || 0,
            scheduled: entry.scheduled || 0,
            sits: entry.sits || 0,
            sales: entry.sales || 0,
            ap: entry.ap || 0,
          }
        };
      });

      console.log('[MetricsLoad] Formatted history:', {
        count: formattedHistory.length,
        dates: formattedHistory.map(h => ({
          date: h.date,
          parsed: parseISO(h.date).toISOString()
        }))
      });

      // Update state in a single atomic operation
      setHistory(formattedHistory);
      return formattedHistory;
    } catch (error) {
      console.error('[MetricsLoad] Error loading metrics history:', error);
      if (retryCount < 2) {
        console.log('[MetricsLoad] Error occurred, retrying...');
        return loadHistory(retryCount + 1);
      }
      toast({
        title: "Error",
        description: "Failed to load metrics history",
        variant: "destructive",
      });
      return [];
    }
  }, [toast]);

  const addOptimisticEntry = useCallback((date: string, metrics: MetricCount) => {
    console.log('[MetricsLoad] Adding optimistic entry:', { 
      date,
      parsed: parseISO(date).toISOString(),
      metrics 
    });
    
    setHistory(prev => {
      const newEntry = { date, metrics };
      const existingIndex = prev.findIndex(entry => entry.date === date);
      
      if (existingIndex >= 0) {
        // Replace existing entry
        const updated = [...prev];
        updated[existingIndex] = newEntry;
        console.log('[MetricsLoad] Updated existing entry:', {
          date,
          updatedHistory: updated.map(h => h.date)
        });
        return updated;
      } else {
        // Add new entry and sort by date
        const updated = [...prev, newEntry];
        const sorted = updated.sort((a, b) => 
          parseISO(b.date).getTime() - parseISO(a.date).getTime()
        );
        console.log('[MetricsLoad] Added new entry:', {
          date,
          sortedDates: sorted.map(h => h.date)
        });
        return sorted;
      }
    });
  }, []);

  // Load history on mount and set up real-time subscription
  useEffect(() => {
    console.log('[MetricsLoad] Initial load starting...');
    loadHistory();

    // Set up real-time subscription
    const channel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_metrics'
        },
        async (payload) => {
          console.log('[MetricsLoad] Real-time update received:', payload);
          const updatedHistory = await loadHistory();
          console.log('[MetricsLoad] History after real-time update:', {
            count: updatedHistory.length,
            dates: updatedHistory.map(h => h.date)
          });
        }
      )
      .subscribe();

    return () => {
      console.log('[MetricsLoad] Cleaning up subscription');
      supabase.removeChannel(channel);
    };
  }, [loadHistory]);

  return {
    history,
    loadHistory,
    addOptimisticEntry
  };
};
