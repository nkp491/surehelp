import { useState } from 'react';
import { MetricCount, MetricType, TimePeriod } from '@/types/metrics';
import { format } from 'date-fns';

export const useMetricsState = () => {
  const [metrics, setMetrics] = useState<MetricCount>({
    leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
  });
  
  const [previousMetrics, setPreviousMetrics] = useState<MetricCount>({
    leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
  });
  
  const [metricInputs, setMetricInputs] = useState<{[key: string]: string}>({});
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24h");
  const [trends, setTrends] = useState<{[key: string]: number}>({});
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

  const updateMetricValue = (metric: MetricType, value: number) => {
    setMetrics(prev => {
      const newMetrics = {
        ...prev,
        [metric]: value
      };
      localStorage.setItem('businessMetrics_24h', JSON.stringify(newMetrics));
      return newMetrics;
    });
  };

  const handleInputChange = (metric: MetricType, value: string) => {
    setMetricInputs(prev => ({
      ...prev,
      [metric]: value
    }));

    const numericValue = parseInt(value) || 0;
    if (!isNaN(numericValue)) {
      updateMetricValue(metric, numericValue);
    }
  };

  return {
    metrics,
    setMetrics,
    previousMetrics,
    setPreviousMetrics,
    metricInputs,
    setMetricInputs,
    timePeriod,
    setTimePeriod,
    trends,
    setTrends,
    dateRange,
    setDateRange,
    handleInputChange,
    updateMetricValue,
  };
};