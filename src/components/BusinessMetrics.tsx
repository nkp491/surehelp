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
import { useEffect, useMemo } from "react";
import { useAuthStateManager } from "@/hooks/useAuthStateManager";

const BusinessMetricsContent = () => {
  const { timePeriod, setAggregatedMetrics } = useMetrics();
  const { sortedHistory } = useMetricsHistory();
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

  // Get today's metrics from historical data if available
  const todayMetrics = useMemo(() => {
    if (!sortedHistory?.length || !isAuthenticated) {
      return defaultMetrics;
    }

    const today = format(new Date(), "yyyy-MM-dd");
    const todayEntry = sortedHistory.find(entry => entry.date === today);
    
    // If no exact match, try to find entries from the last few days
    let fallbackEntry = null;
    if (!todayEntry) {
      const now = new Date();
      for (let i = 0; i < 3; i++) {
        const checkDate = format(new Date(now.getTime() - i * 24 * 60 * 60 * 1000), "yyyy-MM-dd");
        const found = sortedHistory.find(entry => entry.date === checkDate);
        if (found) {
          fallbackEntry = found;
          console.log('[BusinessMetrics] Using fallback date:', checkDate);
          break;
        }
      }
    }
    
    const finalEntry = todayEntry || fallbackEntry;
    
    console.log('[BusinessMetrics] Today metrics calculation:', {
      today,
      sortedHistoryLength: sortedHistory.length,
      todayEntry: todayEntry ? todayEntry.metrics : 'Not found',
      fallbackEntry: fallbackEntry ? fallbackEntry.metrics : 'Not found',
      result: finalEntry ? finalEntry.metrics : defaultMetrics
    });
    
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

  // Debug logging
  useEffect(() => {
    console.log('[BusinessMetrics] Component state:', {
      timePeriod,
      sortedHistoryLength: sortedHistory?.length || 0,
      isAuthenticated,
      todayMetrics,
      aggregatedMetrics,
      hasData: sortedHistory && sortedHistory.length > 0
    });
  }, [timePeriod, sortedHistory, isAuthenticated, todayMetrics, aggregatedMetrics]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-8">
      <Card className="w-full mb-12 p-8 shadow-lg bg-[#F1F1F1]">
        <div className="space-y-8">
          <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow-sm text-[#2A6F97]">
            <TimeControls />
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm space-y-8 text-[#2A6F97]">
            <MetricsGrid 
              aggregatedMetrics={aggregatedMetrics} 
              todayMetrics={todayMetrics}
            />
            <Separator className="my-8" />
            <RatiosGrid todayMetrics={todayMetrics} />
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
