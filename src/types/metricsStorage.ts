import { MetricCount, TimePeriod } from './metrics';

export interface MetricsStorageHook {
  loadDailyMetrics: () => MetricCount;
  loadPreviousMetrics: (period: TimePeriod) => MetricCount;
  saveDailyMetrics: (metrics: MetricCount) => void;
  savePeriodMetrics: (period: TimePeriod, metrics: MetricCount) => void;
  savePreviousMetrics: (period: TimePeriod, metrics: MetricCount) => void;
}