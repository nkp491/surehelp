import { Input } from "@/components/ui/input";

interface MetricInputProps {
  metric: string;
  currentValue: number;
  onInputChange: (value: string) => void;
  isAP?: boolean;
}

const MetricInput = ({
  metric,
  currentValue,
  onInputChange,
  isAP = false,
}: MetricInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = isAP 
      ? e.target.value.replace(/[^0-9.]/g, '')
      : e.target.value.replace(/[^0-9]/g, '');
    
    if (isAP) {
      const numericValue = parseFloat(sanitizedValue);
      if (!isNaN(numericValue)) {
        const centsValue = Math.round(numericValue * 100);
        onInputChange(centsValue.toString());
      } else if (sanitizedValue === '') {
        onInputChange('0');
      }
    } else {
      // For non-AP metrics, ensure it's a valid number and convert empty to 0
      const numericValue = parseInt(sanitizedValue);
      if (!isNaN(numericValue)) {
        onInputChange(numericValue.toString());
      } else if (sanitizedValue === '') {
        onInputChange('0');
      }
    }
  };

  const formatValue = (value: number) => {
    if (isAP) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(value / 100);
    }
    return value.toString();
  };

  return (
    <Input
      type="text"
      value={formatValue(currentValue)}
      onChange={handleChange}
      className={`h-6 text-center px-1 text-sm bg-transparent ${
        isAP ? 'w-24' : 'w-16'
      }`}
      aria-label={`${metric} count`}
    />
  );
};

export default MetricInput;