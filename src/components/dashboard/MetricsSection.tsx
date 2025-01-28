import { Card } from "@/components/ui/card";
import MetricButtons from "@/components/MetricButtons";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { useMetricsUpdates } from "@/hooks/useMetricsUpdates";
import { Button } from "@/components/ui/button";

const MetricsSection = () => {
  const { metrics, handleInputChange } = useMetrics();
  const { updateMetric, saveDailyMetrics } = useMetricsUpdates(metrics, handleInputChange);

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
    <div className="py-6">
      <div className="flex justify-between items-center">
        <div className="flex gap-16">
          {(Object.keys(metrics) as MetricType[]).map((metric) => (
            <div key={metric} className="flex flex-col items-center">
              <span className="text-[#2A6F97] text-sm font-medium mb-2">
                {metricLabels[metric]}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateMetric(metric, false)}
                  className="w-6 h-6 flex items-center justify-center text-[#2A6F97] border border-[#2A6F97] rounded"
                >
                  -
                </button>
                <span className="w-12 text-center">{metrics[metric]}</span>
                <button 
                  onClick={() => updateMetric(metric, true)}
                  className="w-6 h-6 flex items-center justify-center text-[#2A6F97] border border-[#2A6F97] rounded"
                >
                  +
                </button>
              </div>
            </div>
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
  );
};

export default MetricsSection;