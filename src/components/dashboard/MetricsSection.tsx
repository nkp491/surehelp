import { Card } from "@/components/ui/card";
import MetricButtons from "@/components/MetricButtons";
import { useToast } from "@/hooks/use-toast";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";

const MetricsSection = () => {
  const { toast } = useToast();
  const { metrics } = useMetrics();

  const updateMetric = (metric: string, increment: boolean) => {
    toast({
      title: "Metric Updated",
      description: `${metric.toUpperCase()} has been ${increment ? 'increased' : 'decreased'}`,
    });
  };

  return (
    <Card className="p-6 mb-12 bg-white shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {Object.entries(metrics).map(([metric]) => (
          <MetricButtons
            key={metric}
            metric={metric}
            onIncrement={() => updateMetric(metric, true)}
            onDecrement={() => updateMetric(metric, false)}
          />
        ))}
      </div>
    </Card>
  );
};

export default MetricsSection;