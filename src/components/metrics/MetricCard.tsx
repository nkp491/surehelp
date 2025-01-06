import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface MetricCardProps {
  metric: string;
  value: number;
  inputValue: string;
  onInputChange: (value: string) => void;
  isCurrency?: boolean;
}

const MetricCard = ({
  metric,
  value,
  inputValue,
  onInputChange,
  isCurrency = false,
}: MetricCardProps) => {
  const formatMetricName = (metric: string) => {
    return metric === 'ap' ? 'AP' : metric.charAt(0).toUpperCase() + metric.slice(1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (isCurrency) {
      value = value.replace(/[^\d.]/g, '');
      const parts = value.split('.');
      if (parts.length > 2) return;
      if (parts[1]?.length > 2) return;
    }
    
    onInputChange(value);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col items-center gap-2">
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