import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

  const formatValue = (metric: string, value: number) => {
    if (metric === 'ap') {
      return `$${(value / 100).toFixed(2)}`;
    }
    return value.toString();
  };

  const currentValue = metrics[metric as MetricType] || 0;

  const handleIncrement = () => {
    const newValue = metric === 'ap' 
      ? currentValue + 100 
      : currentValue + 1;
    handleInputChange(metric as MetricType, newValue.toString());
    onIncrement();
  };

  const handleDecrement = () => {
    if (currentValue <= 0) return;
    const newValue = metric === 'ap'
      ? Math.max(0, currentValue - 100)
      : Math.max(0, currentValue - 1);
    handleInputChange(metric as MetricType, newValue.toString());
    onDecrement();
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-semibold text-lg capitalize">
          {formatMetricName(metric)}
        </h3>
        <div className="text-xl font-bold mb-2">
          {formatValue(metric, currentValue)}
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