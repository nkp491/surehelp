import React, { useState, useEffect } from "react";
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
      const numericValue = newValue.replace(/[^\d.]/g, '');
      onChange(numericValue);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5">$</span>
        <Input
          type="text" // Using text instead of number for better formatting control
          value={displayValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={cn(
            "pl-7",
            error ? "border-destructive" : "border-input"
          )}
          required={required}
          readOnly={readOnly}
          inputMode="decimal" // Better for mobile keyboards
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default CurrencyField;