import React from "react";
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
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="relative">
        <span className="absolute left-3 top-2.5">$</span>
        <Input
          type="number"
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "pl-7",
            error ? "border-destructive" : "border-input"
          )}
          required={required}
          readOnly={readOnly}
          min="0"
          step="0.01"
        />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default CurrencyField;