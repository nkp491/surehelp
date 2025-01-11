import { MetricCount, MetricTrends } from "@/types/metrics";

export const useMetricsCalculations = () => {
  const calculateTrends = (currentMetrics: MetricCount, previousMetrics: MetricCount): MetricTrends => {
    const trends: MetricTrends = {};
    Object.keys(currentMetrics).forEach((key) => {
      const current = currentMetrics[key];
      const previous = previousMetrics[key];
      if (previous === 0) {
        trends[key] = 0;
      } else {
        trends[key] = Math.round(((current - previous) / previous) * 100);
      }
    });
    return trends;
  };

  const initializeInputs = (metricsData: MetricCount): {[key: string]: string} => {
    const initialInputs: {[key: string]: string} = {};
    Object.entries(metricsData).forEach(([key, value]) => {
      initialInputs[key] = key === 'ap' ? 
        (value ? (value as number / 100).toFixed(2) : '0.00') : 
        value?.toString() || '0';
    });
    return initialInputs;
  };

  return {
    calculateTrends,
    initializeInputs,
  };
};