
import { useMetrics } from "@/contexts/MetricsContext";
import RatioCard from "./RatioCard";
import LeadMTDSpend from "./LeadMTDSpend";
import { calculateRatios } from "@/utils/metricsUtils";
import { MetricCount } from "@/types/metrics";

interface RatiosGridProps {
  customMetrics?: MetricCount;
  showLeadSpend?: boolean;
}

const RatiosGrid = ({ customMetrics, showLeadSpend = true }: RatiosGridProps) => {
  const { metrics, timePeriod, aggregatedMetrics } = useMetrics();

  // Use provided custom metrics, or aggregated metrics for non-24h views, or default metrics
  const metricsToUse: MetricCount = customMetrics || (timePeriod === '24h' ? metrics : (aggregatedMetrics || metrics));
  const ratios = calculateRatios(metricsToUse);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
      {showLeadSpend && <LeadMTDSpend />}
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
