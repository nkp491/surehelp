
import { Skeleton } from "@/components/ui/skeleton";
import RatiosGrid from "@/components/metrics/RatiosGrid";
import { MetricCount } from "@/types/metrics";
import { Badge } from "@/components/ui/badge";
import { Info } from "lucide-react";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip";

interface TeamMetricsRatiosProps {
  isLoading: boolean;
  teamId?: string;
  aggregatedMetrics: MetricCount | null;
  hierarchicalView?: boolean;
}

export function TeamMetricsRatios({ 
  isLoading, 
  teamId, 
  aggregatedMetrics, 
  hierarchicalView = false 
}: TeamMetricsRatiosProps) {
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
      <div className="relative">
        {hierarchicalView && (
          <div className="absolute top-0 right-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Info className="h-3 w-3" />
                    Hierarchical View
                  </Badge>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs max-w-xs">
                    Showing ratios calculated from metrics for this team and all sub-teams in the hierarchy
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
        <RatiosGrid 
          teamId={teamId} 
          metrics={aggregatedMetrics}
        />
      </div>
    </div>
  );
}
