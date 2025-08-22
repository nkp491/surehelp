import { Card } from "@/components/ui/card";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";
import MetricInput from "./metrics/MetricInput";
import MetricControls from "./metrics/MetricControls";
import { Separator } from "./ui/separator";

interface MetricButtonsProps {
  metric: string;
  onIncrement: () => void;
  onDecrement: () => void;
  isLast?: boolean;
}

const MetricButtons = ({
  metric,
  onIncrement,
  onDecrement,
  isLast = false,
}: MetricButtonsProps) => {
  const { metrics, handleInputChange } = useMetrics();

  const formatMetricName = (metric: string) => {
    return metric === "ap"
      ? "AP"
      : metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  const currentValue = metrics[metric as MetricType];
  const isAP = metric === "ap";

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

  const handleMetricInputChange = async (value: string) => {
    const numericValue = isAP ? value : parseInt(value).toString();
    await handleInputChange(metric as MetricType, numericValue);
  };

  return (
    <div className="flex items-center">
      <div className="flex flex-col items-center gap-0.5 mx-[2px]">
        <h3 className="font-medium text-sm text-primary">
          {formatMetricName(metric)}
        </h3>
        <Card className="bg-transparent p-0.5 border-0 shadow-none">
          <div className="flex flex-col items-center gap-0.5">
            <MetricInput
              metric={metric}
              currentValue={currentValue}
              onInputChange={handleMetricInputChange}
              isAP={isAP}
            />
            <MetricControls
              onIncrement={handleIncrement}
              onDecrement={handleDecrement}
            />
          </div>
        </Card>
      </div>
      {!isLast && (
        <Separator orientation="vertical" className="h-12 mx-3 bg-[#D9D9D9]" />
      )}
    </div>
  );
};

export default MetricButtons;
