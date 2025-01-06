import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";

interface MetricCardProps {
  metric: string;
  value: number;
  inputValue: string;
  onInputChange: (value: string) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  formatValue?: (value: number) => string;
}

const MetricCard = ({
  metric,
  value,
  inputValue,
  onInputChange,
  onIncrement,
  onDecrement,
  formatValue = (value) => value.toString(),
}: MetricCardProps) => {
  const formatMetricName = (metric: string) => {
    return metric.toUpperCase() === 'AP' ? 'AP' : metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2 w-full justify-center mb-2">
          <Button
            onClick={onDecrement}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <Button
            onClick={onIncrement}
            variant="outline"
            size="icon"
            className="h-8 w-8"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <h3 className="font-semibold text-lg capitalize">
          {formatMetricName(metric)}
        </h3>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => onInputChange(e.target.value)}
          className="text-center w-full max-w-xl font-bold text-lg"
          placeholder="0"
        />
        <div className="text-sm text-gray-600">
          {formatValue(value)}
        </div>
      </div>
    </Card>
  );
};

export default MetricCard;