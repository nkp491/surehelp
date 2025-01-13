import { MetricCount, TimePeriod } from '@/types/metrics';

export const useMetricsStorage = () => {
  const loadDailyMetrics = (): MetricCount => {
    const dailyMetrics = localStorage.getItem('businessMetrics_24h');
    return dailyMetrics ? JSON.parse(dailyMetrics) : {
      leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
    };
  };

  const loadPreviousMetrics = (period: TimePeriod): MetricCount => {
    const storedPreviousMetrics = localStorage.getItem(`previousBusinessMetrics_${period}`);
    return storedPreviousMetrics ? JSON.parse(storedPreviousMetrics) : {
      leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
    };
  };

  const saveDailyMetrics = (metrics: MetricCount) => {
    localStorage.setItem('businessMetrics_24h', JSON.stringify(metrics));
  };

  const savePeriodMetrics = (period: TimePeriod, metrics: MetricCount) => {
    localStorage.setItem(`businessMetrics_${period}`, JSON.stringify(metrics));
  };

  const savePreviousMetrics = (period: TimePeriod, metrics: MetricCount) => {
    localStorage.setItem(`previousBusinessMetrics_${period}`, JSON.stringify(metrics));
  };

  return {
    loadDailyMetrics,
    loadPreviousMetrics,
    saveDailyMetrics,
    savePeriodMetrics,
    savePreviousMetrics,
  };
};