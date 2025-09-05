import { useMetrics } from "@/contexts/MetricsContext";
import MetricCard from "./MetricCard";
import { MetricsGridSkeleton } from "../ui/loading-skeleton";

interface MetricsGridProps {
  aggregatedMetrics: Record<string, number>;
  todayMetrics: Record<string, number>;
  isLoading?: boolean;
}

const MetricsGrid = ({
  aggregatedMetrics,
  todayMetrics,
  isLoading = false,
}: MetricsGridProps) => {
  const { metrics, trends, timePeriod } = useMetrics();
  const displayMetrics =
    timePeriod === "24h" ? todayMetrics : aggregatedMetrics;

  if (isLoading) {
    return <MetricsGridSkeleton />;
  }

  if (!displayMetrics) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No metrics data available</p>
      </div>
    );
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
