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
import { format } from "date-fns";
import { MetricCount } from "@/types/metrics";
import { useEffect, useMemo, useState } from "react";
import { useAuthStateManager } from "@/hooks/useAuthStateManager";
import { PageSkeleton } from "./ui/loading-skeleton";
import { ErrorBoundary } from "./ui/error-boundary";

const BusinessMetricsContent = () => {
  const { timePeriod, dateRange, setAggregatedMetrics } = useMetrics();
  const { sortedHistory, isLoading: historyLoading } = useMetricsHistory();
  const { isAuthenticated } = useAuthStateManager();
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const defaultMetrics = useMemo(() => ({
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0,
  }), []);

  // Memoize the calculation function to prevent unnecessary recalculations
  const aggregatedMetrics = useMemo(() => {
    if (!sortedHistory?.length || !isAuthenticated) {
      return defaultMetrics;
    }

    const now = new Date();
    let startDate: Date;
    let endDate: Date = now;

    switch (timePeriod) {
      case "7d":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "30d":
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case "custom":
        if (dateRange.from) {
          startDate = dateRange.from;
          endDate = dateRange.to || now;
        } else {
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }
        break;
      default:
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
    }

    const result = sortedHistory.reduce(
      (acc: MetricCount, entry) => {
        const entryCreatedAt = new Date(entry.created_at);
        if (entryCreatedAt >= startDate && entryCreatedAt <= endDate) {
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

    return result;
  }, [timePeriod, dateRange, sortedHistory, isAuthenticated, defaultMetrics]);

  // Get today's metrics from historical data if available (sum all entries for today)
  const todayMetrics = useMemo(() => {
    if (!sortedHistory?.length || !isAuthenticated) {
      return defaultMetrics;
    }

    const today = format(new Date(), "yyyy-MM-dd");

    // Sum all entries for today
    const todayEntries = sortedHistory.filter((entry) => entry.date === today);

    if (todayEntries.length > 0) {
      return todayEntries.reduce(
        (acc, entry) => {
          Object.entries(entry.metrics).forEach(([key, value]) => {
            if (key in acc) {
              acc[key as keyof MetricCount] += Number(value) || 0;
            }
          });
          return acc;
        },
        { ...defaultMetrics }
      );
    }

    // If no entries for today, try to find entries from the last few days
    const now = new Date();
    for (let i = 1; i <= 3; i++) {
      const checkDate = format(
        new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        "yyyy-MM-dd"
      );
      const foundEntries = sortedHistory.filter(
        (entry) => entry.date === checkDate
      );
      if (foundEntries.length > 0) {
        return foundEntries.reduce(
          (acc, entry) => {
            Object.entries(entry.metrics).forEach(([key, value]) => {
              if (key in acc) {
                acc[key as keyof MetricCount] += Number(value) || 0;
              }
            });
            return acc;
          },
          { ...defaultMetrics }
        );
      }
    }

    return defaultMetrics;
  }, [sortedHistory, isAuthenticated, defaultMetrics]);

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
          {hasData && (
            <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm text-[#2A6F97]">
              <TimeControls />
            </div>
          )}

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
