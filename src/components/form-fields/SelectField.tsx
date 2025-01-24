import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface SelectFieldProps {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  options: string[];
}

const SelectField = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  readOnly = false,
  options,
}: SelectFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={readOnly}
      >
        <SelectTrigger className={cn(error ? "border-destructive" : "border-input")}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default SelectField;