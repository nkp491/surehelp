import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { MetricsProvider, useMetrics } from "@/contexts/MetricsContext";
import TimeControls from "./metrics/TimeControls";
import MetricsGrid from "./metrics/MetricsGrid";
import RatiosGrid from "./metrics/RatiosGrid";
import MetricsChart from "./MetricsChart";
import MetricsHistory from "./metrics/MetricsHistory";
import LeadExpenseReport from "./lead-expenses/LeadExpenseReport";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";
import { startOfDay } from "date-fns";
import { MetricCount } from "@/types/metrics";
import { useEffect, useMemo } from "react";
import { useAuthStateManager } from "@/hooks/useAuthStateManager";
import { Loader2 } from "lucide-react";

const BusinessMetricsContent = () => {
  const { timePeriod, setAggregatedMetrics } = useMetrics();
  const { sortedHistory, isLoading } = useMetricsHistory();
  const { isAuthenticated } = useAuthStateManager();

  const defaultMetrics = {
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0,
  };

  // Memoize the calculation function to prevent unnecessary recalculations
  const aggregatedMetrics = useMemo(() => {
    if (!sortedHistory?.length || !isAuthenticated) {
      return defaultMetrics;
    }

    const now = startOfDay(new Date());
    const periodRange = timePeriod === "7d" ? 7 : timePeriod === "30d" ? 30 : 1;

    return sortedHistory.reduce(
      (acc: MetricCount, entry) => {
        const entryDate = new Date(entry.date);
        const daysDiff = Math.floor(
          (now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (daysDiff <= periodRange) {
          Object.entries(entry.metrics).forEach(([key, value]) => {
            if (key in acc) {
              acc[key as keyof MetricCount] += Number(value) || 0;
            }
          });
        }

        return acc;
      },
      { ...defaultMetrics }
    );
  }, [timePeriod, sortedHistory, isAuthenticated]);

  // Update aggregated metrics when dependencies change
  useEffect(() => {
    if (sortedHistory?.length > 0 && isAuthenticated) {
      setAggregatedMetrics(aggregatedMetrics);
    }
  }, [
    aggregatedMetrics,
    setAggregatedMetrics,
    sortedHistory,
    timePeriod,
    isAuthenticated,
  ]);

  if (!isAuthenticated) {
    return null;
  }

  // Show loading state for initial data fetch
  if (isLoading && sortedHistory.length === 0) {
    return (
      <div className="space-y-8">
        <Card className="w-full mb-12 p-8 shadow-lg bg-[#F1F1F1]">
          <div className="flex items-center justify-center py-16">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              <p className="text-lg text-muted-foreground">
                Loading KPI Insights...
              </p>
              <p className="text-sm text-muted-foreground">
                Please wait while we fetch your data
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Card className="w-full mb-12 p-8 shadow-lg bg-[#F1F1F1]">
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm text-[#2A6F97]">
            <TimeControls />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm space-y-8 text-[#2A6F97]">
            <MetricsGrid aggregatedMetrics={aggregatedMetrics} />
            <Separator className="my-8" />
            <RatiosGrid />
          </div>

          <MetricsChart timePeriod={timePeriod} onTimePeriodChange={() => {}} />

          <div className="bg-white p-6 rounded-lg shadow-sm text-[#2A6F97]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">KPI HISTORY</h2>
            </div>
            <MetricsHistory />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm text-[#2A6F97]">
            <LeadExpenseReport />
          </div>
        </div>
      </Card>
    </div>
  );
};

const BusinessMetrics = () => {
  return (
    <MetricsProvider>
      <BusinessMetricsContent />
    </MetricsProvider>
  );
};

export default BusinessMetrics;
