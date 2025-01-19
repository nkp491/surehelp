import MetricButtons from "@/components/MetricButtons";
import { MetricType } from "@/types/metrics";

interface MetricsButtonGridProps {
  metrics: Record<string, number>;
  onMetricUpdate: (metric: string, increment: boolean) => void;
}

const MetricsButtonGrid = ({ metrics, onMetricUpdate }: MetricsButtonGridProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
      {Object.keys(metrics).map((metric) => (
        <MetricButtons
          key={metric}
          metric={metric}
          onIncrement={() => onMetricUpdate(metric, true)}
          onDecrement={() => onMetricUpdate(metric, false)}
        />
      ))}
    </div>
  );
};

export default MetricsButtonGrid;