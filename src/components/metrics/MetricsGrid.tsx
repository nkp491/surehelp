import { useMetrics } from "@/contexts/MetricsContext";
import MetricCard from "./MetricCard";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";

interface MetricsGridProps {
  aggregatedMetrics: Record<string, number>;
}

const MetricsGrid = ({ aggregatedMetrics }: MetricsGridProps) => {
  const { metrics, trends, timePeriod } = useMetrics();
  const { isLoading } = useMetricsHistory();
  const displayMetrics = timePeriod === "24h" ? metrics : aggregatedMetrics;

  // Show skeleton loading if data is loading and no metrics are available
  if (
    isLoading &&
    (!displayMetrics || Object.values(displayMetrics).every((v) => v === 0))
  ) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        {Array.from({ length: 7 }).map((_, index) => (
          <div
            key={index}
            className="p-3 bg-gray-50 rounded-lg shadow-sm animate-pulse"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="h-4 bg-gray-200 rounded w-16"></div>
              <div className="h-6 bg-gray-200 rounded w-12"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

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
