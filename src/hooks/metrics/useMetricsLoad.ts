import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCount } from '@/types/metrics';
import { useToast } from '@/hooks/use-toast';
import { format, parseISO, subMonths } from 'date-fns';
import { useRoleCheck } from '@/hooks/useRoleCheck';

export const useMetricsLoad = () => {
  const [history, setHistory] = useState<Array<{ date: string; metrics: MetricCount }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { hasRequiredRole, userRoles } = useRoleCheck();

  // Determine history access level based on user role
  const hasFullHistoryAccess = 
    userRoles.includes('system_admin') || 
    hasRequiredRole([
      'agent_pro', 'manager_pro', 'manager_pro_gold', 
      'manager_pro_platinum', 'beta_user'
    ]);

  const loadHistory = useCallback(async (retryCount = 0) => {
    try {
      setIsLoading(true);
      
      const sessionResult = await supabase.auth.getSession();
      const user = sessionResult.data.session?.user;
      
      if (!user) {
        console.log('[MetricsLoad] No user found, returning empty history');
        return [];
      }

      console.log('[MetricsLoad] Loading history for user:', user.id);
      
      // Add a small delay on retry attempts
      if (retryCount > 0) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Get data from the last 3 months for pro users, 7 days for basic users
      const historyLookbackDate = hasFullHistoryAccess
        ? format(subMonths(new Date(), 3), 'yyyy-MM-dd')
        : format(subMonths(new Date(), 1), 'yyyy-MM-dd');

      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', historyLookbackDate)
        .order('date', { ascending: false });

      if (error) {
        console.error('[MetricsLoad] Error fetching data:', error);
        throw error;
      }

      console.log('[MetricsLoad] Raw data from database:', {
        count: data?.length,
        dateRange: `${historyLookbackDate} to now`,
        firstEntry: data?.[0],
        lastEntry: data?.[data.length - 1],
        hasFullAccess: hasFullHistoryAccess
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
    } finally {
      setIsLoading(false);
    }
  }, [toast, hasFullHistoryAccess, userRoles]);

  const loadMoreHistory = useCallback(async () => {
    // Only allow loading more history for users with full access
    if (!hasFullHistoryAccess) {
      console.log('[MetricsLoad] User does not have permission to load more history');
      return;
    }
    
    try {
      setIsLoading(true);
      const { data: user } = await supabase.auth.getUser();
      if (!user.user || history.length === 0) return;

      const oldestEntry = history[history.length - 1];
      const { data, error } = await supabase
        .from('daily_metrics')
        .select('*')
        .eq('user_id', user.user.id)
        .lt('date', oldestEntry.date)
        .order('date', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedNewHistory = data.map(entry => ({
        date: format(parseISO(entry.date), 'yyyy-MM-dd'),
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

      setHistory(prev => [...prev, ...formattedNewHistory]);
      return formattedNewHistory;
    } catch (error) {
      console.error('[MetricsLoad] Error loading more history:', error);
      toast({
        title: "Error",
        description: "Failed to load more history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [history, toast, hasFullHistoryAccess]);

  // Load initial history and set up real-time subscription
  useEffect(() => {
    console.log('[MetricsLoad] Initial load starting...');
    loadHistory();

    // Set up real-time subscription for recent changes only
    const channel = supabase
      .channel('metrics-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_metrics',
          filter: `date=gte.${format(subMonths(new Date(), 1), 'yyyy-MM-dd')}`
        },
        async (payload) => {
          console.log('[MetricsLoad] Real-time update received:', payload);
          await loadHistory();
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
    isLoading,
    loadHistory,
    loadMoreHistory,
    addOptimisticEntry: useCallback((date: string, metrics: MetricCount) => {
      setHistory(prev => {
        const newEntry = { date, metrics };
        const existingIndex = prev.findIndex(entry => entry.date === date);
        
        if (existingIndex >= 0) {
          const updated = [...prev];
          updated[existingIndex] = newEntry;
          return updated;
        } else {
          const updated = [newEntry, ...prev];
          return updated.slice(0, 100); // Keep only the most recent 100 entries in memory
        }
      });
    }, []),
    hasFullHistoryAccess
  };
};
