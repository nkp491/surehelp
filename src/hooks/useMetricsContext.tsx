
import { createContext, useContext, useState } from "react";
import { MetricCount, MetricsContextType, TimePeriod } from "@/types/metrics";
import { calculateRatios } from "@/utils/metricsUtils";

// Create a context with default values
const MetricsContext = createContext<MetricsContextType>({
  metrics: { leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0 },
  previousMetrics: { leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0 },
  metricInputs: {},
  timePeriod: "24h",
  trends: {},
  dateRange: { from: undefined, to: undefined },
  ratios: [],
  aggregatedMetrics: null,
  setAggregatedMetrics: () => {},
  setDateRange: () => {},
  setMetrics: () => {},
  handleTimePeriodChange: () => {},
  handleInputChange: () => {},
  refreshMetrics: async () => {},
});

// Provider component
export const MetricsProvider = ({ children }: { children: React.ReactNode }) => {
  const [metrics, setMetricsState] = useState<MetricCount>({ 
    leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0 
  });
  const [previousMetrics, setPreviousMetrics] = useState<MetricCount>({ 
    leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0 
  });
  const [metricInputs, setMetricInputs] = useState<{[key: string]: string}>({});
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24h");
  const [trends, setTrends] = useState<{[key: string]: number}>({});
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  });
  const [aggregatedMetrics, setAggregatedMetrics] = useState<MetricCount | null>(null);

  const ratios = calculateRatios(aggregatedMetrics || metrics);

  const setMetrics = (newMetrics: MetricCount) => {
    setPreviousMetrics(metrics);
    setMetricsState(newMetrics);
  };

  const handleTimePeriodChange = (period: TimePeriod) => {
    setTimePeriod(period);
  };

  const handleInputChange = (metric: string, value: string) => {
    setMetricInputs(prev => ({ ...prev, [metric]: value }));
  };

  const refreshMetrics = async () => {
    // In a real app, this would fetch metrics from an API
    console.log("Refreshing metrics...");
  };

  return (
    <MetricsContext.Provider
      value={{
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
        handleInputChange,
        refreshMetrics,
      }}
    >
      {children}
    </MetricsContext.Provider>
  );
};

// Custom hook to use the metrics context
export const useMetrics = () => {
  const context = useContext(MetricsContext);
  if (context === undefined) {
    throw new Error("useMetrics must be used within a MetricsProvider");
  }
  return context;
};

export default useMetrics;
