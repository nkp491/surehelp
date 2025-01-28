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
    <div className="w-full h-[129px] bg-white">
      <div className="py-6 px-8">
        <div className="flex justify-center items-center relative">
          <div className="flex gap-6">
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
            className="bg-[#2A6F97] text-white px-8 absolute right-0"
          >
            Log
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MetricsSection;