import { useMetrics } from "@/contexts/MetricsContext";
import MetricCard from "./MetricCard";

interface MetricsGridProps {
  aggregatedMetrics: Record<string, number>;
}

const MetricsGrid = ({ aggregatedMetrics }: MetricsGridProps) => {
  const { metrics, metricInputs, handleInputChange, trends, timePeriod } = useMetrics();

  // Use current metrics only for 24h view, otherwise use aggregated metrics
  const displayMetrics = timePeriod === '24h' ? metrics : aggregatedMetrics;

  if (!displayMetrics) {
    return null;
  }

  console.log('[MetricsGrid] Displaying metrics:', {
    timePeriod,
    displayMetrics,
    aggregatedMetrics,
    currentMetrics: metrics
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-4">
      {Object.entries(displayMetrics).map(([metric, count]) => (
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