import { Input } from "@/components/ui/input";
import { MetricType } from "@/types/metrics";

interface MetricInputProps {
  metric: string;
  currentValue: number;
  onInputChange: (value: string) => void;
  isAP: boolean;
}

const MetricInput = ({ metric, currentValue, onInputChange, isAP }: MetricInputProps) => {
  const formatValue = (value: number, isAP: boolean) => {
    if (isAP) {
      return (value / 100).toFixed(2);
    }
    return value.toString();
  };

  const handleDirectInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (inputValue === '') {
      onInputChange('0');
      return;
    }

    if (isAP) {
      const cleanedValue = inputValue.replace(/[^\d.]/g, '');
      const parts = cleanedValue.split('.');
      const sanitizedValue = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');
      
      const dollarValue = parseFloat(sanitizedValue);
      if (!isNaN(dollarValue)) {
        const centsValue = Math.round(dollarValue * 100);
        onInputChange(centsValue.toString());
      }
    } else {
      const numValue = parseInt(inputValue);
      if (!isNaN(numValue) && numValue >= 0) {
        onInputChange(numValue.toString());
      }
    }
  };

  return (
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
  );
};

export default MetricInput;