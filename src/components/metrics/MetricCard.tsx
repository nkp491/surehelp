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
  isCurrency?: boolean;
}

const MetricCard = ({
  metric,
  value,
  inputValue,
  onInputChange,
  onIncrement,
  onDecrement,
  isCurrency = false,
}: MetricCardProps) => {
  const formatMetricName = (metric: string) => {
    return metric === 'ap' ? 'AP' : metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (isCurrency) {
      // Allow only valid currency input
      value = value.replace(/[^\d.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) return; // Don't allow multiple decimal points
      if (parts[1]?.length > 2) return; // Don't allow more than 2 decimal places
    }
    
    onInputChange(value);
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
          value={isCurrency ? `$${inputValue}` : inputValue}
          onChange={handleInputChange}
          className="text-center w-full max-w-xl font-bold text-lg"
          placeholder={isCurrency ? "$0.00" : "0"}
        />
      </div>
    </Card>
  );
};

export default MetricCard;