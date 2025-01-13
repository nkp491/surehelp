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

  const currentValue = metrics[metric as MetricType];

  const handleIncrement = () => {
    if (metric === 'ap') {
      handleInputChange(metric as MetricType, (currentValue + 100).toString());
      onIncrement();
    } else {
      handleInputChange(metric as MetricType, (currentValue + 1).toString());
      onIncrement();
    }
  };

  const handleDecrement = () => {
    if (currentValue <= 0) return;
    
    if (metric === 'ap') {
      const newValue = Math.max(0, currentValue - 100);
      handleInputChange(metric as MetricType, newValue.toString());
      onDecrement();
    } else {
      const newValue = Math.max(0, currentValue - 1);
      handleInputChange(metric as MetricType, newValue.toString());
      onDecrement();
    }
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (metric === 'ap') {
      // Handle empty input
      if (inputValue === '') {
        handleInputChange(metric as MetricType, '0');
        return;
      }

      // Only allow numbers and one decimal point
      if (!/^\d*\.?\d*$/.test(inputValue)) {
        return;
      }

      // Store the exact input value in cents
      // For example, if user types "3", we store 300 cents ($3.00)
      // If user types "3.50", we store 350 cents ($3.50)
      const cleanInput = inputValue.replace(/[^\d.]/g, '');
      const parts = cleanInput.split('.');
      let cents = 0;

      if (parts.length === 1) {
        // No decimal point, treat as whole dollars
        cents = parseInt(parts[0]) * 100;
      } else if (parts.length === 2) {
        // Has decimal point
        const dollars = parseInt(parts[0]) || 0;
        const decimal = parts[1].padEnd(2, '0').slice(0, 2);
        cents = (dollars * 100) + parseInt(decimal);
      }

      if (!isNaN(cents)) {
        handleInputChange(metric as MetricType, cents.toString());
      }
    } else {
      // For non-AP metrics, only allow positive integers
      const numValue = parseInt(inputValue);
      if (!isNaN(numValue) && numValue >= 0) {
        handleInputChange(metric as MetricType, numValue.toString());
      } else if (inputValue === '') {
        handleInputChange(metric as MetricType, '0');
      }
    }
  };

  const getDisplayValue = () => {
    if (metric === 'ap') {
      const dollars = currentValue / 100;
      return dollars.toFixed(2);
    }
    return currentValue.toString();
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-2">
        <h3 className="font-semibold text-lg capitalize">
          {formatMetricName(metric)}
        </h3>
        <div className="relative">
          {metric === 'ap' && (
            <span className="absolute left-3 top-2.5">$</span>
          )}
          <Input
            type="text"
            value={getDisplayValue()}
            onChange={handleDirectInput}
            className={`text-center w-24 font-bold ${metric === 'ap' ? 'pl-7' : ''}`}
            min="0"
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