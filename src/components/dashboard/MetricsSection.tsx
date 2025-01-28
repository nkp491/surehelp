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
        <div className="flex flex-col space-y-0">
          <div className="w-full max-w-3xl mx-auto">
            <MetricsHeader onSave={saveDailyMetrics} />
            <div className="flex justify-center">
              <div className="inline-flex gap-0.5 flex-wrap justify-center">
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
          </div>
        </div>
      </Card>
    </div>
  );
};

export default MetricsSection;