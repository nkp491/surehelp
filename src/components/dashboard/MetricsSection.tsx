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
    <div className="space-y-4">
      <Card className="p-6 mb-12 bg-white shadow-md">
        <div className="flex flex-col space-y-6">
          <MetricsHeader onSave={saveDailyMetrics} />
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
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