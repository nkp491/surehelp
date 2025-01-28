import { Card } from "@/components/ui/card";
import MetricButtons from "@/components/MetricButtons";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { useMetricsUpdates } from "@/hooks/useMetricsUpdates";
import { Button } from "@/components/ui/button";

const MetricsSection = () => {
  const { metrics, handleInputChange } = useMetrics();
  const { saveDailyMetrics } = useMetricsUpdates(metrics, handleInputChange);

  const metricLabels = {
    leads: 'Leads',
    calls: 'Calls',
    contacts: 'Contacts',
    scheduled: 'Scheduled',
    sits: 'Sits',
    sales: 'Sales',
    ap: 'AP'
  };

  return (
    <div className="absolute w-[1799px] h-[129px] left-0 top-[98px] bg-white shadow-[0px_2px_6px_#ABABAB]">
      <div className="py-6 px-8">
        <div className="flex justify-between items-center">
          <div className="flex gap-16">
            {(Object.keys(metrics) as MetricType[]).map((metric) => (
              <MetricButtons
                key={metric}
                metric={metric}
                onIncrement={() => {}}
                onDecrement={() => {}}
              />
            ))}
          </div>
          <Button 
            onClick={saveDailyMetrics}
            className="bg-[#2A6F97] text-white px-8"
          >
            Log
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;