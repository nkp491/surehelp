import { Card } from "@/components/ui/card";
import MetricButtons from "@/components/MetricButtons";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import { useMetricsUpdates } from "@/hooks/useMetricsUpdates";
import MetricsHeader from "@/components/metrics/MetricsHeader";

const MetricsSection = () => {
  const { metrics, handleInputChange } = useMetrics();
  const { updateMetric, saveDailyMetrics } = useMetricsUpdates(metrics, handleInputChange);

  return (
    <div>
      <Card className="bg-transparent shadow-none border-none">
        <div className="flex flex-col space-y-1">
          <MetricsHeader onSave={saveDailyMetrics} />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-1.5">
            {(Object.keys(metrics) as MetricType[]).map((metric) => (
              <MetricButtons
                key={metric}
                metric={metric}
                onIncrement={() => updateMetric(metric, true)}
                onDecrement={() => updateMetric(metric, false)}
              />
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MetricsSection;