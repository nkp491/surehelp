import { useMetrics } from "@/contexts/MetricsContext";
import MetricCard from "./MetricCard";

const MetricsGrid = () => {
  const { metrics, metricInputs, handleInputChange, trends } = useMetrics();

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-4">
      {Object.entries(metrics).map(([metric, count]) => (
        <MetricCard
          key={metric}
          metric={metric}
          value={count}
          inputValue={metricInputs[metric] || '0'}
          onInputChange={(value) => handleInputChange(metric as any, value)}
          isCurrency={metric === 'ap'}
          trend={trends[metric] || 0}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;