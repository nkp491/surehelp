import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const FormField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
}: FormFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full p-2 rounded-md border",
          error ? "border-destructive" : "border-input"
        )}
        required={required}
      />
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default FormField;