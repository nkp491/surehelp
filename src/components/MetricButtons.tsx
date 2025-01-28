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
    handleInputChange(metric as MetricType, newValue.toString());
    onIncrement();
  };

  const handleDecrement = () => {
    if (currentValue <= 0) return;
    const decrement = isAP ? 100 : 1;
    const newValue = Math.max(0, currentValue - decrement);
    handleInputChange(metric as MetricType, newValue.toString());
    onDecrement();
  };

  return (
    <div className="flex flex-col items-center gap-0.5">
      <h3 className="font-medium text-xs text-primary">
        {formatMetricName(metric)}
      </h3>
      <Card className="bg-gray-50 p-1.5 border-0 shadow-none">
        <div className="flex flex-col items-center gap-0.5">
          <MetricInput
            metric={metric}
            currentValue={currentValue}
            onInputChange={(value) => {
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
    </div>
  );
};

export default MetricButtons;