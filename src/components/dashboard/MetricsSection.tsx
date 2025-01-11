import { Card } from "@/components/ui/card";
import MetricButtons from "@/components/MetricButtons";
import { useToast } from "@/hooks/use-toast";

interface MetricsSectionProps {
  metrics: { [key: string]: number };
  setMetrics: React.Dispatch<React.SetStateAction<{ [key: string]: number }>>;
}

const MetricsSection = ({ metrics, setMetrics }: MetricsSectionProps) => {
  const { toast } = useToast();

  const updateMetric = (metric: string, increment: boolean) => {
    setMetrics((prev) => {
      const currentValue = prev[metric];
      let newValue;
      
      if (metric === 'ap') {
        newValue = currentValue + (increment ? 100 : -100);
        if (newValue < 0) newValue = 0;
      } else {
        newValue = currentValue + (increment ? 1 : -1);
        if (newValue < 0) newValue = 0;
      }

      const newMetrics = {
        ...prev,
        [metric]: newValue,
      };

      localStorage.setItem("businessMetrics_24h", JSON.stringify(newMetrics));
      toast({
        title: "Metric Updated",
        description: `${metric.toUpperCase()} has been ${increment ? 'increased' : 'decreased'}`,
      });
      return newMetrics;
    });
  };

  return (
    <Card className="p-6 mb-12 bg-white shadow-md">
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {Object.entries(metrics).map(([metric, value]) => (
          <MetricButtons
            key={metric}
            metric={metric}
            value={value}
            onIncrement={() => updateMetric(metric, true)}
            onDecrement={() => updateMetric(metric, false)}
          />
        ))}
      </div>
    </Card>
  );
};

export default MetricsSection;