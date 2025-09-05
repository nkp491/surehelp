import { Card } from "@/components/ui/card";
import { MetricType } from "@/types/metrics";
import MetricInput from "./metrics/MetricInput";
import MetricControls from "./metrics/MetricControls";
import { Separator } from "./ui/separator";

interface MetricButtonsProps {
  metric: string;
  currentValue: number;
  onInputChange: (metric: MetricType, value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  isLast?: boolean;
}

const MetricButtons = ({
  metric,
  currentValue,
  onInputChange,
  onIncrement,
  onDecrement,
  isLast = false,
}: MetricButtonsProps) => {
  const formatMetricName = (metric: string) => {
    return metric === "ap"
      ? "AP"
      : metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  const isAP = metric === "ap";

  const handleIncrement = () => {
    onIncrement();
  };

  const handleDecrement = () => {
    onDecrement();
  };

  const handleMetricInputChange = (value: string) => {
    onInputChange(metric as MetricType, value);
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
