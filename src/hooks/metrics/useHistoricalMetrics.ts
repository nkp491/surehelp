import { MetricCount, DatabaseMetric, TimePeriod } from '@/types/metrics';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export const useHistoricalMetrics = () => {
  const loadPreviousMetrics = async (period: TimePeriod): Promise<MetricCount> => {
    const today = startOfDay(new Date());
    let startDate;

    switch (period) {
      case '7d':
        startDate = subDays(today, 7);
        break;
      case '30d':
        startDate = subDays(today, 30);
        break;
      default:
        startDate = subDays(today, 1);
    }

    console.log('[HistoricalMetrics] Loading from:', format(startDate, 'yyyy-MM-dd'));

    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lt('date', format(today, 'yyyy-MM-dd'))
      .order('date', { ascending: false });

    if (error) {
      console.error('[HistoricalMetrics] Error loading metrics:', error);
      return {
        leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
      };
    }

    const metrics = (data as DatabaseMetric[]).reduce((acc, curr) => ({
      leads: acc.leads + (curr.leads || 0),
      calls: acc.calls + (curr.calls || 0),
      contacts: acc.contacts + (curr.contacts || 0),
      scheduled: acc.scheduled + (curr.scheduled || 0),
      sits: acc.sits + (curr.sits || 0),
      sales: acc.sales + (curr.sales || 0),
      ap: acc.ap + (curr.ap || 0),
    }), {
      leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
    });

    console.log('[HistoricalMetrics] Loaded metrics:', metrics);
    return metrics;
  };

  return {
    loadPreviousMetrics,
  };
};