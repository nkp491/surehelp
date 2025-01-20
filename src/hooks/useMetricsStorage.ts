import { MetricCount, TimePeriod } from '@/types/metrics';
import { useDailyMetrics } from './metrics/useDailyMetrics';
import { useHistoricalMetrics } from './metrics/useHistoricalMetrics';

export const useMetricsStorage = () => {
  const { loadDailyMetrics, saveDailyMetrics } = useDailyMetrics();
  const { loadPreviousMetrics } = useHistoricalMetrics();

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