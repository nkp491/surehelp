import { useMetrics } from "@/contexts/MetricsContext";
import RatioCard from "./RatioCard";
import LeadMTDSpend from "./LeadMTDSpend";
import { calculateRatios } from "@/utils/metricsUtils";
import { MetricCount } from "@/types/metrics";

const RatiosGrid = () => {
  const { metrics, timePeriod, aggregatedMetrics } = useMetrics();

  // Use aggregated metrics for non-24h views
  const metricsToUse: MetricCount = timePeriod === '24h' ? metrics : (aggregatedMetrics || metrics);
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
