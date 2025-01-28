import { Card } from "@/components/ui/card";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import MetricInput from "./metrics/MetricInput";
import MetricControls from "./metrics/MetricControls";

interface MetricButtonsProps {
  metric: string;
  onIncrement: () => void;
  onDecrement: () => void;
  hasBorder?: boolean;
}

const MetricButtons = ({
  metric,
  onIncrement,
  onDecrement,
  hasBorder = true,
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
    <div className="flex flex-col items-stretch">
      <div className="text-[rgba(42,111,151,1)] text-lg font-bold text-center">
        {formatMetricName(metric)}
      </div>
      <div className="flex items-stretch gap-5 text-2xl text-black justify-between mt-2">
        <div className="flex flex-col items-stretch my-auto">
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
        {hasBorder && (
          <div className="border w-px shrink-0 h-[58px] border-[rgba(171,171,171,1)] border-solid" />
        )}
      </div>
    </div>
  );
};

export default MetricButtons;