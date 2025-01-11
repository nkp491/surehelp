export type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";
export type TimePeriod = "24h" | "7d" | "30d" | "custom";

export interface MetricCount {
  [key: string]: number;
}

export interface MetricTrends {
  [key: string]: number;
}

export interface MetricsContextType {
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