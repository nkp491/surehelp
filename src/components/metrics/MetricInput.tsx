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
    const value = e.target.value.replace(/[^0-9]/g, '');
    onInputChange(value);
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
      className={`h-6 text-center px-1 text-sm bg-white ${
        isAP ? 'w-24' : 'w-16'
      }`}
      aria-label={`${metric} count`}
    />
  );
};

export default MetricInput;