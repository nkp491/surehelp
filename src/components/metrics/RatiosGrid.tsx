import { useMetrics } from "@/contexts/MetricsContext";
import RatioCard from "./RatioCard";
import LeadMTDSpend from "./LeadMTDSpend";
import { calculateRatios } from "@/utils/metricsUtils";
import { MetricCount } from "@/types/metrics";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";

const RatiosGrid = () => {
  const { metrics, timePeriod, aggregatedMetrics } = useMetrics();
  const { isLoading } = useMetricsHistory();

  // Use aggregated metrics for non-24h views
  const metricsToUse: MetricCount =
    timePeriod === "24h" ? metrics : aggregatedMetrics || metrics;
  const ratios = calculateRatios(metricsToUse);

  // Show skeleton loading if data is loading and no metrics are available
  if (
    isLoading &&
    (!metricsToUse || Object.values(metricsToUse).every((v) => v === 0))
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

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      <LeadMTDSpend />
      {ratios.map((ratio, index) => (
        <RatioCard
          key={`${ratio.label}-${timePeriod}-${index}`}
          label={ratio.label}
          value={ratio.value}
        />
      ))}
    </div>
  );
};

export default RatiosGrid;
