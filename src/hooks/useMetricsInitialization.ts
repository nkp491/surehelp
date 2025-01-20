import { useEffect } from 'react';
import { format } from 'date-fns';
import { MetricCount, TimePeriod } from '@/types/metrics';

export const useMetricsInitialization = (
  timePeriod: TimePeriod,
  dateRange: { from: Date | undefined; to: Date | undefined },
  setMetrics: (metrics: MetricCount) => void,
  setPreviousMetrics: (metrics: MetricCount) => void,
  setTrends: (trends: { [key: string]: number }) => void,
  loadDailyMetrics: () => Promise<MetricCount>,
  loadPreviousMetrics: (period: TimePeriod) => Promise<MetricCount>,
  savePeriodMetrics: (period: TimePeriod, metrics: MetricCount) => Promise<void>,
  initializeInputs: (metrics: MetricCount) => void,
  calculateTrends: (current: MetricCount, previous: MetricCount) => { [key: string]: number }
) => {
  useEffect(() => {
    const initializeMetrics = async () => {
      if (timePeriod === "custom" && dateRange.from && dateRange.to) {
        const key = `businessMetrics_custom_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`;
        const storedMetrics = localStorage.getItem(key);
        if (storedMetrics) {
          setMetrics(JSON.parse(storedMetrics));
        }
      } else {
        const dailyMetrics = await loadDailyMetrics();
        setMetrics(dailyMetrics);
        initializeInputs(dailyMetrics);
        
        if (timePeriod !== '24h') {
          await savePeriodMetrics(timePeriod, dailyMetrics);
        }

        const previousMetricsData = await loadPreviousMetrics(timePeriod);
        if (previousMetricsData) {
          setPreviousMetrics(previousMetricsData);
          const newTrends = calculateTrends(dailyMetrics, previousMetricsData);
          setTrends(newTrends);
        }
      }
    };

    initializeMetrics();
  }, [timePeriod, dateRange]);
};