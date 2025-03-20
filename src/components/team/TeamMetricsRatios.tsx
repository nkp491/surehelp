
import { Skeleton } from "@/components/ui/skeleton";
import RatiosGrid from "@/components/metrics/RatiosGrid";
import { MetricCount } from "@/types/metrics";
import { calculateRatios } from "@/utils/metricsUtils";
import RatioCard from "@/components/metrics/RatioCard";

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

  // Calculate ratios directly from aggregated metrics
  const ratios = calculateRatios(aggregatedMetrics);
  
  // Display the most important ratios in a grid
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {ratios.slice(0, 12).map((ratio, index) => (
          <RatioCard
            key={`${ratio.label}-${index}`}
            label={ratio.label}
            value={ratio.value}
          />
        ))}
      </div>
    </div>
  );
}
