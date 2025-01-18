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
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('date', format(today, 'yyyy-MM-dd'))
      .maybeSingle();

    if (error) {
      console.error('Error loading daily metrics:', error);
      return {
        leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
      };
    }

    return data ? extractMetricData(data as DatabaseMetric) : {
      leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
    };
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

    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .lt('date', format(today, 'yyyy-MM-dd'));

    if (error) {
      console.error('Error loading previous metrics:', error);
      return {
        leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
      };
    }

    // Aggregate metrics for the period
    return (data as DatabaseMetric[]).reduce((acc, curr) => ({
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
  };

  const saveDailyMetrics = async (metrics: MetricCount) => {
    const today = format(startOfDay(new Date()), 'yyyy-MM-dd');
    const user = supabase.auth.getUser();
    
    if (!user) {
      console.error('No user found');
      return;
    }

    const { data: existingMetrics } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (existingMetrics) {
      const { error } = await supabase
        .from('daily_metrics')
        .update(metrics)
        .eq('date', today);

      if (error) console.error('Error updating daily metrics:', error);
    } else {
      const { error } = await supabase
        .from('daily_metrics')
        .insert([{ 
          ...metrics, 
          date: today,
          user_id: (await user).data.user?.id 
        }]);

      if (error) console.error('Error inserting daily metrics:', error);
    }
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