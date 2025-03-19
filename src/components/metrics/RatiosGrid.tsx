
import useMetrics from "@/hooks/useMetricsContext";
import RatioCard from "./RatioCard";
import LeadMTDSpend from "./LeadMTDSpend";
import { calculateRatios } from "@/utils/metricsUtils";
import { MetricCount } from "@/types/metrics";
import { useTeamMetrics } from "@/hooks/useTeamMetrics";

const RatiosGrid = ({ teamId }: { teamId?: string }) => {
  const { metrics, timePeriod, aggregatedMetrics } = useMetrics();
  const { teamMetrics } = useTeamMetrics(teamId);
  
  // Calculate team aggregated metrics if teamId is provided
  const teamAggregatedMetrics: MetricCount | null = teamMetrics?.length ? {
    leads: teamMetrics.reduce((sum, member) => sum + member.metrics.total_leads, 0),
    calls: teamMetrics.reduce((sum, member) => sum + member.metrics.total_calls, 0),
    contacts: teamMetrics.reduce((sum, member) => sum + member.metrics.total_contacts, 0),
    scheduled: teamMetrics.reduce((sum, member) => sum + member.metrics.total_scheduled, 0),
    sits: teamMetrics.reduce((sum, member) => sum + member.metrics.total_sits, 0),
    sales: teamMetrics.reduce((sum, member) => sum + member.metrics.total_sales, 0),
    ap: teamMetrics.reduce((sum, member) => sum + member.metrics.average_ap, 0),
  } : null;

  // Use team metrics if available, otherwise fall back to individual metrics
  const metricsToUse: MetricCount = teamAggregatedMetrics || 
    (timePeriod === '24h' ? metrics : (aggregatedMetrics || metrics));
    
  const ratios = calculateRatios(metricsToUse);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {!teamId && <LeadMTDSpend />}
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
