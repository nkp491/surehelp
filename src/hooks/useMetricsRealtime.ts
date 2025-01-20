import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { MetricCount } from '@/types/metrics';

export const useMetricsRealtime = (
  setMetrics: (metrics: MetricCount) => void,
  loadDailyMetrics: () => Promise<MetricCount>,
  initializeInputs: (metrics: MetricCount) => void
) => {
  useEffect(() => {
    const channel = supabase
      .channel('metrics-context-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_metrics'
        },
        async () => {
          const dailyMetrics = await loadDailyMetrics();
          setMetrics(dailyMetrics);
          initializeInputs(dailyMetrics);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [setMetrics, loadDailyMetrics, initializeInputs]);
};