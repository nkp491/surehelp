import { MetricCount, DatabaseMetric } from '@/types/metrics';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { formatInTimeZone } from 'date-fns-tz';

const extractMetricData = (data: DatabaseMetric): MetricCount => {
  const { leads, calls, contacts, scheduled, sits, sales, ap } = data;
  return { leads, calls, contacts, scheduled, sits, sales, ap };
};

export const useDailyMetrics = () => {
  const loadDailyMetrics = async (): Promise<MetricCount> => {
    const today = formatInTimeZone(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd');
    console.log('[DailyMetrics] Loading metrics for:', today);
    
    const { data, error } = await supabase
      .from('daily_metrics')
      .select('*')
      .eq('date', today)
      .maybeSingle();

    if (error) {
      console.error('[DailyMetrics] Error loading metrics:', error);
      return {
        leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
      };
    }

    const metrics = data ? extractMetricData(data as DatabaseMetric) : {
      leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
    };
    
    console.log('[DailyMetrics] Loaded metrics:', {
      raw: data,
      extracted: metrics
    });
    return metrics;
  };

  const saveDailyMetrics = async (metrics: MetricCount) => {
    console.log('[DailyMetrics] Saving metrics:', metrics);
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      console.error('[DailyMetrics] No user found');
      return;
    }

    const today = formatInTimeZone(new Date(), 'America/Los_Angeles', 'yyyy-MM-dd');
    console.log('[DailyMetrics] Saving for date:', today);

    const { error, data } = await supabase
      .from('daily_metrics')
      .upsert({
        user_id: user.user.id,
        date: today,
        ...metrics
      }, {
        onConflict: 'user_id,date'
      })
      .select()
      .single();

    if (error) {
      console.error('[DailyMetrics] Error saving metrics:', error);
      throw error;
    }

    console.log('[DailyMetrics] Successfully saved metrics:', {
      saved: metrics,
      response: data,
      savedDate: today
    });
  };

  return {
    loadDailyMetrics,
    saveDailyMetrics,
  };
};
