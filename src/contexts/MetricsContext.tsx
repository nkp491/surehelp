
import { createContext, useContext, ReactNode } from "react";
import { calculateRatios } from "@/utils/metricsUtils";
import { useMetricsStorage } from "@/hooks/useMetricsStorage";
import { useMetricsCalculations } from "@/hooks/useMetricsCalculations";
import { useMetricsState } from "@/hooks/useMetricsState";
import { MetricType, TimePeriod, MetricsContextType } from "@/types/metrics";
import { useMetricsRealtime } from "@/hooks/useMetricsRealtime";
import { useMetricsInitialization } from "@/hooks/useMetricsInitialization";

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider = ({ children }: { children: ReactNode }) => {
  const {
    metrics,
    previousMetrics,
    timePeriod,
    trends,
    dateRange,
    aggregatedMetrics,
    setAggregatedMetrics,
    setMetrics,
    setPreviousMetrics,
    setTrends,
    setDateRange,
    handleInputChange,
    setTimePeriod,
  } = useMetricsState();

  const { 
    loadDailyMetrics,
    loadPreviousMetrics,
    savePeriodMetrics,
  } = useMetricsStorage();

  const {
    calculateTrends,
    initializeInputs,
  } = useMetricsCalculations();

  useMetricsRealtime(metrics);

  useMetricsInitialization(
    timePeriod,
    dateRange,
    setMetrics,
    setPreviousMetrics,
    setTrends,
    loadDailyMetrics,
    loadPreviousMetrics,
    savePeriodMetrics,
    initializeInputs,
    calculateTrends
  );

  const handleTimePeriodChange = async (period: TimePeriod) => {
    setPreviousMetrics(metrics);
    setTimePeriod(period);
    if (period !== "custom") {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  const handleMetricInputChange = async (metric: MetricType, value: string) => {
    handleInputChange(metric, value);
  };

  const refreshMetrics = async () => {
    const dailyMetrics = await loadDailyMetrics();
    setMetrics(dailyMetrics);
    initializeInputs(dailyMetrics);
    
    const previousMetricsData = await loadPreviousMetrics(timePeriod);
    if (previousMetricsData) {
      setPreviousMetrics(previousMetricsData);
      const newTrends = calculateTrends(dailyMetrics, previousMetricsData);
      setTrends(newTrends);
    }
  };

  const ratios = calculateRatios(metrics);

  const value = {
    metrics,
    previousMetrics,
    metricInputs,
    timePeriod,
    trends,
    dateRange,
    ratios,
    aggregatedMetrics,
    setAggregatedMetrics,
    setDateRange,
    setMetrics,
    handleTimePeriodChange,
    handleInputChange: handleMetricInputChange,
    refreshMetrics,
  };

  return (
    <MetricsContext.Provider value={value}>
      {children}
    </MetricsContext.Provider>
  );
};

export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error('useMetrics must be used within a MetricsProvider');
  }
  return context;
};
