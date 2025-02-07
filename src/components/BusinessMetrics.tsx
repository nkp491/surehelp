
import { Card } from "./ui/card";
import { Separator } from "./ui/separator";
import { MetricsProvider } from "@/contexts/MetricsContext";
import TimeControls from "./metrics/TimeControls";
import MetricsGrid from "./metrics/MetricsGrid";
import RatiosGrid from "./metrics/RatiosGrid";
import MetricsChart from "./MetricsChart";
import { useMetrics } from "@/contexts/MetricsContext";
import MetricsHistory from "./metrics/MetricsHistory";
import LeadExpenseReport from "./lead-expenses/LeadExpenseReport";
import { useMetricsHistory } from "@/hooks/useMetricsHistory";
import { startOfDay } from "date-fns";
import { MetricCount } from "@/types/metrics";
import { useEffect, useMemo } from "react";

const BusinessMetricsContent = () => {
  const { timePeriod, setAggregatedMetrics } = useMetrics();
  const { sortedHistory } = useMetricsHistory();
  
  const defaultMetrics = {
    leads: 0,
    calls: 0,
    contacts: 0,
    scheduled: 0,
    sits: 0,
    sales: 0,
    ap: 0
  };

  // Memoize the calculation function to prevent unnecessary recalculations
  const aggregatedMetrics = useMemo(() => {
    if (!sortedHistory?.length) {
      return defaultMetrics;
    }

    const now = startOfDay(new Date());
    const periodRange = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 30 : 1;

    return sortedHistory.reduce((acc: MetricCount, entry) => {
      const entryDate = new Date(entry.date);
      const daysDiff = Math.floor((now.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff <= periodRange) {
        Object.entries(entry.metrics).forEach(([key, value]) => {
          if (key in acc) {
            acc[key as keyof MetricCount] += Number(value) || 0;
          }
        });
      }
      
      return acc;
    }, { ...defaultMetrics });
  }, [timePeriod, sortedHistory]);

  // Update aggregated metrics when dependencies change
  useEffect(() => {
    if (sortedHistory?.length > 0) {
      setAggregatedMetrics(aggregatedMetrics);

      console.log('[BusinessMetrics] Updated aggregated metrics:', {
        timePeriod,
        metrics: aggregatedMetrics,
        historyLength: sortedHistory.length,
        firstEntry: sortedHistory[0]
      });
    }
  }, [aggregatedMetrics, setAggregatedMetrics, sortedHistory, timePeriod]);
  
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

          <MetricsChart 
            timePeriod={timePeriod}
            onTimePeriodChange={() => {}}
          />

          <div className="bg-[#FFFCF6] p-6 rounded-lg shadow-sm text-[#2A6F97]">
            <h3 className="text-xl font-semibold mb-4 text-left">Historical KPIs</h3>
            <MetricsHistory />
          </div>

          <div className="bg-[#FFFCF6] p-6 rounded-lg shadow-sm text-[#2A6F97]">
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
