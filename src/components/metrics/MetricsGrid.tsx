
import { useMetrics } from "@/contexts/MetricsContext";
import MetricCard from "./MetricCard";

interface MetricsGridProps {
  aggregatedMetrics: Record<string, number>;
}

const MetricsGrid = ({ aggregatedMetrics }: MetricsGridProps) => {
  const { metrics, metricInputs, handleInputChange, trends, timePeriod } = useMetrics();

  // Always use aggregated metrics for non-24h views
  const displayMetrics = timePeriod === '24h' ? metrics : aggregatedMetrics;

  console.log('[MetricsGrid] Displaying metrics:', {
    timePeriod,
    displayMetrics,
    aggregatedMetrics,
    currentMetrics: metrics
  });

  if (!displayMetrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-8 gap-4">
      {Object.entries(displayMetrics).map(([metric, count]) => (
        <MetricCard
          key={`${metric}-${timePeriod}`} // Add timePeriod to force re-render
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
