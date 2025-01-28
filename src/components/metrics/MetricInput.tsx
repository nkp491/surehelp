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
      className="rounded bg-[rgba(235,236,238,1)] font-extrabold text-2xl text-center px-3 py-2 h-auto"
      aria-label={`${metric} count`}
    />
  );
};

export default MetricInput;