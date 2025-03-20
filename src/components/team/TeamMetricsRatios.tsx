
import { Skeleton } from "@/components/ui/skeleton";
import RatiosGrid from "@/components/metrics/RatiosGrid";
import { MetricCount } from "@/types/metrics";

interface TeamMetricsRatiosProps {
  isLoading: boolean;
  teamId?: string;
  aggregatedMetrics: MetricCount | null;
}

export function TeamMetricsRatios({ isLoading, teamId, aggregatedMetrics }: TeamMetricsRatiosProps) {
  if (isLoading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  if (!aggregatedMetrics) {
    return (
      <div className="text-center p-6">
        <p className="text-muted-foreground">No metrics available for ratio calculation</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RatiosGrid teamId={teamId} />
    </div>
  );
}
