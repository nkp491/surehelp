import { createContext, useContext, useEffect, ReactNode } from "react";
import { calculateRatios } from "@/utils/metricsUtils";
import { format } from "date-fns";
import { useMetricsStorage } from "@/hooks/useMetricsStorage";
import { useMetricsCalculations } from "@/hooks/useMetricsCalculations";
import { useMetricsState } from "@/hooks/useMetricsState";
import { MetricType, TimePeriod, MetricsContextType } from "@/types/metrics";

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider = ({ children }: { children: ReactNode }) => {
  const {
    metrics,
    previousMetrics,
    metricInputs,
    timePeriod,
    trends,
    dateRange,
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
    saveDailyMetrics,
    savePeriodMetrics,
  } = useMetricsStorage();

  const {
    calculateTrends,
    initializeInputs,
  } = useMetricsCalculations();

  useEffect(() => {
    if (timePeriod === "custom" && dateRange.from && dateRange.to) {
      const key = `businessMetrics_custom_${format(dateRange.from, 'yyyy-MM-dd')}_${format(dateRange.to, 'yyyy-MM-dd')}`;
      const storedMetrics = localStorage.getItem(key);
      if (storedMetrics) {
        setMetrics(JSON.parse(storedMetrics));
      }
    } else {
      loadMetricsForPeriod(timePeriod);
    }
  }, [timePeriod, dateRange]);

  const loadMetricsForPeriod = (period: TimePeriod) => {
    const parsedDailyMetrics = loadDailyMetrics();
    setMetrics(parsedDailyMetrics);
    initializeInputs(parsedDailyMetrics);
    
    if (period !== '24h') {
      savePeriodMetrics(period, parsedDailyMetrics);
    }

    const previousMetricsData = loadPreviousMetrics(period);
    if (previousMetricsData) {
      setPreviousMetrics(previousMetricsData);
    }

    const newTrends = calculateTrends(parsedDailyMetrics, previousMetricsData);
    setTrends(newTrends);
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setPreviousMetrics(metrics);
    localStorage.setItem(`previousBusinessMetrics_${timePeriod}`, JSON.stringify(metrics));
    setTimePeriod(period);
    if (period !== "custom") {
      setDateRange({ from: undefined, to: undefined });
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
    setDateRange,
    handleTimePeriodChange,
    handleInputChange,
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