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

  const handleTimePeriodChange = async (period: TimePeriod) => {
    setPreviousMetrics(metrics);
    await saveDailyMetrics(metrics);
    setTimePeriod(period);
    if (period !== "custom") {
      setDateRange({ from: undefined, to: undefined });
    }
  };

  const handleMetricInputChange = async (metric: MetricType, value: string) => {
    handleInputChange(metric, value);
    await saveDailyMetrics(metrics);
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
    handleInputChange: handleMetricInputChange,
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