import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { useMetrics } from "@/contexts/MetricsContext";
import { MetricType } from "@/types/metrics";

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

  const formatValue = (value: number, isAP: boolean) => {
    if (isAP) {
      return (value / 100).toFixed(2);
    }
    return value.toString();
  };

  const currentValue = metrics[metric as MetricType];
  const isAP = metric === 'ap';

  const handleIncrement = () => {
    const increment = isAP ? 100 : 1; // $1.00 for AP, 1 for others
    handleInputChange(metric as MetricType, (currentValue + increment).toString());
    onIncrement();
  };

  const handleDecrement = () => {
    if (currentValue <= 0) return;
    const decrement = isAP ? 100 : 1; // $1.00 for AP, 1 for others
    const newValue = Math.max(0, currentValue - decrement);
    handleInputChange(metric as MetricType, newValue.toString());
    onDecrement();
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      handleInputChange(metric as MetricType, '0');
      return;
    }

    if (isAP) {
      // Convert dollar amount to cents
      const dollarValue = parseFloat(inputValue);
      if (!isNaN(dollarValue)) {
        const centsValue = Math.round(dollarValue * 100);
        handleInputChange(metric as MetricType, centsValue.toString());
      }
    } else {
      // Handle non-AP metrics
      const numValue = parseInt(inputValue);
      if (!isNaN(numValue) && numValue >= 0) {
        handleInputChange(metric as MetricType, numValue.toString());
      }
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-semibold text-lg capitalize text-primary">
          {formatMetricName(metric)}
        </h3>
        <div className="relative">
          {isAP && (
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-primary">
              $
            </span>
          )}
          <Input
            type="text"
            value={formatValue(currentValue, isAP)}
            onChange={handleDirectInput}
            className={`text-center w-24 font-bold text-primary ${isAP ? 'pl-6' : ''}`}
            min="0"
            step={isAP ? "0.01" : "1"}
          />
        </div>
        <div className="flex items-center gap-2 w-full justify-center">
          <Button
            onClick={handleDecrement}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleIncrement}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default MetricButtons;