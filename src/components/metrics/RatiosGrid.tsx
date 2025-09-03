import { useMetrics } from "@/contexts/MetricsContext";
import RatioCard from "./RatioCard";
import LeadMTDSpend from "./LeadMTDSpend";
import { calculateRatios } from "@/utils/metricsUtils";
import { MetricCount } from "@/types/metrics";

interface RatiosGridProps {
  todayMetrics?: Record<string, number>;
}

const RatiosGrid = ({ todayMetrics }: RatiosGridProps) => {
  const { metrics, timePeriod, aggregatedMetrics } = useMetrics();

  // Use todayMetrics for 24h view, aggregatedMetrics for other views
  const metricsToUse: MetricCount = timePeriod === '24h' ? (todayMetrics || metrics) : (aggregatedMetrics || metrics);
  const ratios = calculateRatios(metricsToUse);

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
