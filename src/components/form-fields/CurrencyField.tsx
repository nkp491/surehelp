import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CurrencyFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
}

const CurrencyField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  readOnly = false,
}: CurrencyFieldProps) => {
  // Local state to handle the display value
  const [displayValue, setDisplayValue] = useState(value);

  // Update local state when prop value changes
  useEffect(() => {
    // Only update if the value has actually changed to avoid input cursor jumping
    if (value !== displayValue) {
      setDisplayValue(value);
    }
  }, [value]);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;

    // Update local display value
    setDisplayValue(newValue);

    // Notify parent with the raw numeric value
    if (onChange) {
      // Remove any non-numeric characters except decimal point
      const numericValue = newValue.replace(/[^\d.]/g, "");
      onChange(numericValue);
    }
  };

  return (
    <div className="space-y-2 min-h-[80px] flex flex-col justify-start">
      <Label className="text-sm font-medium text-gray-700 flex-shrink-0">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <Input
            type="text" // Using text instead of number for better formatting control
            value={displayValue}
            onChange={handleChange}
            placeholder={placeholder}
            className={cn(
              "pl-7 h-11 bg-gray-50 transition-all duration-200",
              error ? "border-destructive" : "border-input"
            )}
            required={required}
            readOnly={readOnly}
            inputMode="decimal" // Better for mobile keyboards
          />
        </div>
        {error && (
          <p className="text-sm text-destructive mt-1 flex-shrink-0">{error}</p>
        )}
      </div>
    </div>
  );
};

export default CurrencyField;
