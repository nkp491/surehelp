export type MetricType = "leads" | "calls" | "contacts" | "scheduled" | "sits" | "sales" | "ap";
export type TimePeriod = "24h" | "7d" | "30d" | "custom";
export type ChartType = "bar" | "line" | "pie";

export interface MetricCount extends Record<string, number> {
  leads: number;
  calls: number;
  contacts: number;
  scheduled: number;
  sits: number;
  sales: number;
  ap: number;
}

export interface DatabaseMetric extends MetricCount {
  id: string;
  user_id: string;
  date: string;
  created_at: string;
  updated_at: string;
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