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
import { startOfDay, format } from "date-fns";
import { MetricCount } from "@/types/metrics";
import { useEffect, useMemo, useState } from "react";
import { useAuthStateManager } from "@/hooks/useAuthStateManager";
import { PageSkeleton } from "./ui/loading-skeleton";
import { ErrorBoundary } from "./ui/error-boundary";

const BusinessMetricsContent = () => {
  const { timePeriod, setAggregatedMetrics } = useMetrics();
  const { sortedHistory, isLoading: historyLoading } = useMetricsHistory();
  const { isAuthenticated } = useAuthStateManager();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

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
    let periodRange = 1;
    if (timePeriod === "7d") {
      periodRange = 7;
    } else if (timePeriod === "30d") {
      periodRange = 30;
    }

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

  // Get today's metrics from historical data if available
  const todayMetrics = useMemo(() => {
    if (!sortedHistory?.length || !isAuthenticated) {
      return defaultMetrics;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const todayEntry = sortedHistory.find((entry) => entry.date === today);

    // If no exact match, try to find entries from the last few days
    let fallbackEntry = null;
    if (!todayEntry) {
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const checkDate = format(
          new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
          "yyyy-MM-dd"
        );
        const found = sortedHistory.find((entry) => entry.date === checkDate);
        if (found) {
          fallbackEntry = found;
          break;
        }
      }
    }
    const finalEntry = todayEntry || fallbackEntry;

    return finalEntry ? finalEntry.metrics : defaultMetrics;
  }, [sortedHistory, isAuthenticated]);

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

  // Handle initial load state
  useEffect(() => {
    if (isAuthenticated && !historyLoading) {
      setIsInitialLoad(false);
    }
  }, [isAuthenticated, historyLoading]);

  if (!isAuthenticated) {
    return null;
  }

  // Show loading skeleton during initial load
  if (isInitialLoad || historyLoading) {
    return <PageSkeleton />;
  }

  // Check if we have any data
  const hasData = sortedHistory && sortedHistory.length > 0;

  return (
    <div className="space-y-8">
      <Card className="w-full mb-12 p-8 shadow-lg bg-[#F1F1F1]">
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm text-[#2A6F97]">
            <TimeControls />
          </div>

          {!hasData ? (
            <div className="bg-white p-6 rounded-lg shadow-sm text-[#2A6F97]">
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg
                    className="mx-auto h-12 w-12"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No KPI Data Available
                </h3>
                <p className="text-gray-500 mb-4">
                  Start tracking your metrics to see insights and analytics
                  here.
                </p>
                <p className="text-sm text-gray-400">
                  Add your first metrics entry to begin analyzing your
                  performance.
                </p>
              </div>
            </div>
          ) : (
            <>
              <ErrorBoundary>
                <div className="bg-white p-6 rounded-lg shadow-sm space-y-8 text-[#2A6F97]">
                  <MetricsGrid
                    aggregatedMetrics={aggregatedMetrics}
                    todayMetrics={todayMetrics}
                  />
                  <Separator className="my-8" />
                  <RatiosGrid todayMetrics={todayMetrics} />
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <MetricsChart
                  timePeriod={timePeriod}
                  onTimePeriodChange={() => {}}
                />
              </ErrorBoundary>

              <ErrorBoundary>
                <div className="bg-white p-6 rounded-lg shadow-sm text-[#2A6F97]">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold">KPI HISTORY</h2>
                  </div>
                  <MetricsHistory />
                </div>
              </ErrorBoundary>

              <ErrorBoundary>
                <div className="bg-white p-6 rounded-lg shadow-sm text-[#2A6F97]">
                  <LeadExpenseReport />
                </div>
              </ErrorBoundary>
            </>
          )}
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
