import { MetricCount, TimePeriod, DatabaseMetric } from '@/types/metrics';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, format } from 'date-fns';

export const useMetricsStorage = () => {
  const extractMetricData = (data: DatabaseMetric): MetricCount => {
    const { leads, calls, contacts, scheduled, sits, sales, ap } = data;
    return { leads, calls, contacts, scheduled, sits, sales, ap };
  };

  const loadDailyMetrics = async (): Promise<MetricCount> => {
    const today = startOfDay(new Date());
    console.log('[MetricsStorage] Loading daily metrics for:', format(today, 'yyyy-MM-dd'));
    
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('date', format(today, 'yyyy-MM-dd'))
      .maybeSingle();

    if (error) {
      console.error('[MetricsStorage] Error loading daily metrics:', error);
      return {
        leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
      };
    }

    const metrics = data ? extractMetricData(data as DatabaseMetric) : {
      leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
    };
    
    console.log('[MetricsStorage] Loaded daily metrics:', metrics);
    return metrics;
  };

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

    console.log('[MetricsStorage] Loading previous metrics from:', format(startDate, 'yyyy-MM-dd'));

    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lt('date', format(today, 'yyyy-MM-dd'));

    if (error) {
      console.error('[MetricsStorage] Error loading previous metrics:', error);
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

    console.log('[MetricsStorage] Loaded previous metrics:', metrics);
    return metrics;
  };

  const saveDailyMetrics = async (metrics: MetricCount) => {
    console.log('[MetricsStorage] Saving daily metrics:', metrics);
    const user = await supabase.auth.getUser();
    
    if (!user.data.user) {
      console.error('[MetricsStorage] No user found');
      return;
    }

    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');

    const { error } = await supabase
      .from('daily_metrics')
      .upsert({
        user_id: user.data.user.id,
        date: today,
        ...metrics
      }, {
        onConflict: 'user_id,date'
      });

    if (error) {
      console.error('[MetricsStorage] Error saving daily metrics:', error);
      throw error;
    }

    console.log('[MetricsStorage] Successfully saved daily metrics');
  };

  const savePeriodMetrics = async (period: TimePeriod, metrics: MetricCount) => {
    await saveDailyMetrics(metrics);
  };

  return {
    loadDailyMetrics,
    loadPreviousMetrics,
    saveDailyMetrics,
    savePeriodMetrics,
  };
};