import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { calculateRatios } from "@/utils/metricsUtils";
import { format } from "date-fns"; // Add this import

type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";
type TimePeriod = "24h" | "7d" | "30d" | "custom";

interface MetricCount {
  [key: string]: number;
}

interface MetricTrends {
  [key: string]: number;
}

interface MetricsContextType {
  metrics: MetricCount;
  previousMetrics: MetricCount;
  metricInputs: {[key: string]: string};
  timePeriod: TimePeriod;
  trends: MetricTrends;
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  ratios: Array<{ label: string; value: string | number }>;
  setDateRange: (range: { from: Date | undefined; to: Date | undefined }) => void;
  handleTimePeriodChange: (period: TimePeriod) => void;
  handleInputChange: (metric: MetricType, value: string) => void;
}

const MetricsContext = createContext<MetricsContextType | undefined>(undefined);

export const MetricsProvider = ({ children }: { children: ReactNode }) => {
  const [metrics, setMetrics] = useState<MetricCount>({
    leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
  });
  const [previousMetrics, setPreviousMetrics] = useState<MetricCount>({
    leads: 0, calls: 0, contacts: 0, scheduled: 0, sits: 0, sales: 0, ap: 0,
  });
  const [metricInputs, setMetricInputs] = useState<{[key: string]: string}>({});
  const [timePeriod, setTimePeriod] = useState<TimePeriod>("24h");
  const [trends, setTrends] = useState<MetricTrends>({});
  const [dateRange, setDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({
    from: undefined,
    to: undefined,
  });

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
    const dailyMetrics = localStorage.getItem('businessMetrics_24h');
    let parsedDailyMetrics = dailyMetrics ? JSON.parse(dailyMetrics) : null;
    
    if (period === '24h') {
      if (parsedDailyMetrics) {
        setMetrics(parsedDailyMetrics);
        initializeInputs(parsedDailyMetrics);
      }
    } else {
      const storedMetrics = localStorage.getItem(`businessMetrics_${period}`);
      if (storedMetrics) {
        const parsedMetrics = JSON.parse(storedMetrics);
        if (parsedDailyMetrics) {
          const updatedMetrics = { ...parsedMetrics };
          Object.keys(parsedDailyMetrics).forEach((key) => {
            updatedMetrics[key] = (parsedMetrics[key] || 0) + parsedDailyMetrics[key];
          });
          setMetrics(updatedMetrics);
          localStorage.setItem(`businessMetrics_${period}`, JSON.stringify(updatedMetrics));
          initializeInputs(updatedMetrics);
        } else {
          setMetrics(parsedMetrics);
          initializeInputs(parsedMetrics);
        }
      } else if (parsedDailyMetrics) {
        setMetrics(parsedDailyMetrics);
        localStorage.setItem(`businessMetrics_${period}`, JSON.stringify(parsedDailyMetrics));
        initializeInputs(parsedDailyMetrics);
      }
    }

    const storedPreviousMetrics = localStorage.getItem(`previousBusinessMetrics_${period}`);
    if (storedPreviousMetrics) {
      setPreviousMetrics(JSON.parse(storedPreviousMetrics));
    }

    calculateTrends();
  };

  const initializeInputs = (metricsData: MetricCount) => {
    const initialInputs: {[key: string]: string} = {};
    Object.entries(metricsData).forEach(([key, value]) => {
      initialInputs[key] = key === 'ap' ? 
        (value ? (value as number / 100).toFixed(2) : '0.00') : 
        value?.toString() || '0';
    });
    setMetricInputs(initialInputs);
  };

  const calculateTrends = () => {
    const newTrends: MetricTrends = {};
    Object.keys(metrics).forEach((key) => {
      const current = metrics[key];
      const previous = previousMetrics[key];
      if (previous === 0) {
        newTrends[key] = 0;
      } else {
        newTrends[key] = Math.round(((current - previous) / previous) * 100);
      }
    });
    setTrends(newTrends);
  };

  const handleInputChange = (metric: MetricType, value: string) => {
    setMetricInputs(prev => ({
      ...prev,
      [metric]: value
    }));

    if (metric === 'ap') {
      const numericValue = Math.round(parseFloat(value) * 100) || 0;
      if (!isNaN(numericValue)) {
        updateMetricValue(metric, numericValue);
      }
    } else {
      const numericValue = parseInt(value) || 0;
      if (!isNaN(numericValue)) {
        updateMetricValue(metric, numericValue);
      }
    }
  };

  const updateMetricValue = (metric: MetricType, value: number) => {
    setMetrics(prev => {
      const newMetrics = {
        ...prev,
        [metric]: value
      };
      localStorage.setItem(`businessMetrics_${timePeriod}`, JSON.stringify(newMetrics));
      
      if (timePeriod === '24h') {
        updateAccumulatedMetrics('7d', metric, value);
        updateAccumulatedMetrics('30d', metric, value);
      }
      
      return newMetrics;
    });
  };

  const updateAccumulatedMetrics = (period: TimePeriod, metric: string, dailyValue: number) => {
    const storedMetrics = localStorage.getItem(`businessMetrics_${period}`);
    if (storedMetrics) {
      const parsedMetrics = JSON.parse(storedMetrics);
      parsedMetrics[metric] = dailyValue + (parsedMetrics[metric] || 0);
      localStorage.setItem(`businessMetrics_${period}`, JSON.stringify(parsedMetrics));
    }
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