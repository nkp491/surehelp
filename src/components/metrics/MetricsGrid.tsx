import { useMetrics } from "@/contexts/MetricsContext";
import MetricCard from "./MetricCard";

interface MetricsGridProps {
  aggregatedMetrics: Record<string, number>;
}

const MetricsGrid = ({ aggregatedMetrics }: MetricsGridProps) => {
  const { metrics, trends, timePeriod } = useMetrics();
  const displayMetrics = timePeriod === "24h" ? metrics : aggregatedMetrics;

  if (!displayMetrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {Object.entries(displayMetrics).map(([metric, count]) => (
        <MetricCard
          key={`${metric}-${timePeriod}`}
          metric={metric}
          value={count}
          isCurrency={metric === "ap"}
          trend={trends[metric] || 0}
        />
      ))}
    </div>
  );
};

export default MetricsGrid;
