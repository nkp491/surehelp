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
    // Remove any non-numeric characters except decimal point for AP
    const sanitizedValue = isAP 
      ? e.target.value.replace(/[^0-9.]/g, '')
      : e.target.value.replace(/[^0-9]/g, '');
    
    // For AP values, convert to cents before saving
    if (isAP) {
      const numericValue = parseFloat(sanitizedValue);
      if (!isNaN(numericValue)) {
        const centsValue = Math.round(numericValue * 100);
        onInputChange(centsValue.toString());
      } else if (sanitizedValue === '') {
        onInputChange('0');
      }
    } else {
      // For non-AP metrics, just ensure it's a valid number
      if (sanitizedValue === '' || !isNaN(Number(sanitizedValue))) {
        onInputChange(sanitizedValue === '' ? '0' : sanitizedValue);
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