import { useMetrics } from "@/contexts/MetricsContext";
import RatioCard from "./RatioCard";
import LeadMTDSpend from "./LeadMTDSpend";
import { calculateRatios } from "@/utils/metricsUtils";
import { MetricCount } from "@/types/metrics";
import { MetricsGridSkeleton } from "../ui/loading-skeleton";

interface RatiosGridProps {
  todayMetrics?: Record<string, number>;
  isLoading?: boolean;
}

const RatiosGrid = ({ todayMetrics, isLoading = false }: RatiosGridProps) => {
  const { metrics, timePeriod, aggregatedMetrics } = useMetrics();

  if (isLoading) {
    return <MetricsGridSkeleton />;
  }

  // Use todayMetrics for 24h view, aggregatedMetrics for other views
  const metricsToUse: MetricCount = timePeriod === '24h' 
    ? (todayMetrics || metrics) 
    : (aggregatedMetrics || metrics);
  
  const ratios = calculateRatios(metricsToUse);

  if (!metricsToUse || Object.keys(metricsToUse).length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No ratio data available</p>
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
