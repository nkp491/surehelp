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

  const isAP = metric === 'ap';

  return (
    <Card className={`p-6 transition-all duration-200 hover:shadow-lg ${
      isAP ? 'bg-gradient-to-br from-[#9b87f5] to-[#7E69AB] text-white' : 'bg-white'
    }`}>
      <div className="flex flex-col items-center gap-3">
        <h3 className={`font-semibold text-lg ${isAP ? 'text-white text-xl' : 'text-gray-700'}`}>
          {formatMetricName(metric)}
        </h3>
        <Input
          type="text"
          value={isCurrency ? `$${inputValue}` : inputValue}
          onChange={handleInputChange}
          className={`text-center w-full font-bold text-lg ${
            isAP 
              ? 'bg-white/10 border-white/20 text-white placeholder-white/50 focus:border-white' 
              : 'bg-gray-50 border-gray-200 focus:border-[#9b87f5]'
          }`}
          placeholder={isCurrency ? "$0.00" : "0"}
        />
      </div>
    </Card>
  );
};

export default MetricCard;