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

  const formatValue = (metric: string, value: number) => {
    if (metric === 'ap') {
      return (value / 100).toFixed(2);
    }
    return value.toString();
  };

  const currentValue = metrics[metric as MetricType];

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

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (metric === 'ap') {
      // Remove all non-numeric characters except decimal point
      value = value.replace(/[^\d.]/g, '');
      
      // Handle decimal points
      const parts = value.split('.');
      if (parts.length > 2) {
        // Keep only first decimal point
        value = parts[0] + '.' + parts.slice(1).join('');
      }
      
      // Limit decimal places to 2
      if (parts[1]?.length > 2) {
        value = parts[0] + '.' + parts[1].slice(0, 2);
      }

      // Convert dollar amount to cents for storage
      if (value !== '') {
        const dollarAmount = parseFloat(value);
        if (!isNaN(dollarAmount)) {
          const cents = Math.round(dollarAmount * 100);
          handleInputChange(metric as MetricType, cents.toString());
        }
      }
    } else {
      // For non-currency metrics, only allow positive integers
      const numericValue = parseInt(value);
      if (!isNaN(numericValue) && numericValue >= 0) {
        handleInputChange(metric as MetricType, numericValue.toString());
      }
    }
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
            value={metric === 'ap' ? formatValue(metric, currentValue) : currentValue}
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
