import { Card } from "@/components/ui/card";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import MetricInput from "./metrics/MetricInput";
import MetricControls from "./metrics/MetricControls";

interface MetricButtonsProps {
  metric: string;
  onIncrement: () => void;
  onDecrement: () => void;
}

const MetricButtons = ({
  metric,
  onIncrement,
  onDecrement,
}: MetricButtonsProps) => {
  const { metrics, handleInputChange } = useMetrics();
  
  const formatMetricName = (metric: string) => {
    return metric === 'ap' ? 'AP' : metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  const currentValue = metrics[metric as MetricType];
  const isAP = metric === 'ap';

  const handleIncrement = () => {
    const increment = isAP ? 100 : 1;
    const newValue = currentValue + increment;
    console.log(`[MetricButtons] ${metric} Increment:`, {
      action: 'increment',
      metric,
      currentValue,
      newValue,
      allMetrics: { ...metrics },
      timestamp: new Date().toISOString()
    });
    handleInputChange(metric as MetricType, newValue.toString());
    onIncrement();
  };

  const handleDecrement = () => {
    if (currentValue <= 0) return;
    const decrement = isAP ? 100 : 1;
    const newValue = Math.max(0, currentValue - decrement);
    console.log(`[MetricButtons] ${metric} Decrement:`, {
      action: 'decrement',
      metric,
      currentValue,
      newValue,
      allMetrics: { ...metrics },
      timestamp: new Date().toISOString()
    });
    handleInputChange(metric as MetricType, newValue.toString());
    onDecrement();
  };

  return (
    <Card className="bg-[#FFFCF6] p-4">
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-semibold text-lg capitalize text-primary">
          {formatMetricName(metric)}
        </h3>
        <MetricInput
          metric={metric}
          currentValue={currentValue}
          onInputChange={(value) => {
            console.log(`[MetricButtons] ${metric} Direct input change:`, {
              action: 'direct_input',
              metric,
              currentValue,
              newValue: value,
              allMetrics: { ...metrics },
              timestamp: new Date().toISOString()
            });
            handleInputChange(metric as MetricType, value);
          }}
          isAP={isAP}
        />
        <MetricControls
          onIncrement={handleIncrement}
          onDecrement={handleDecrement}
        />
      </div>
    </Card>
  );
};

export default MetricButtons;