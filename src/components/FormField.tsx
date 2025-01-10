import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  type: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  options?: string[];
}

const FormField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  readOnly = false,
  options = [],
}: FormFieldProps) => {
  if (type === "height") {
    const [feet, inches] = value.split("'").map(v => v.replace('"', ''));
    
    return (
      <div className="space-y-2">
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              type="number"
              value={feet || ""}
              onChange={(e) => {
                const newFeet = e.target.value;
                const newInches = inches || "0";
                onChange?.(`${newFeet}'${newInches}"`);
              }}
              placeholder="Feet"
              min="0"
              max="9"
              className={cn(error ? "border-destructive" : "border-input")}
              required={required}
              readOnly={readOnly}
            />
          </div>
          <div className="flex-1">
            <Input
              type="number"
              value={inches || ""}
              onChange={(e) => {
                const newInches = e.target.value;
                const currentFeet = feet || "0";
                onChange?.(`${currentFeet}'${newInches}"`);
              }}
              placeholder="Inches"
              min="0"
              max="11"
              className={cn(error ? "border-destructive" : "border-input")}
              required={required}
              readOnly={readOnly}
            />
          </div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </div>
    );
  }

  if (type === "currency") {
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
  }

  if (type === "select" && options.length > 0) {
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
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "min-h-[100px]",
            error ? "border-destructive" : "border-input"
          )}
          required={required}
          readOnly={readOnly}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full",
            error ? "border-destructive" : "border-input"
          )}
          required={required}
          readOnly={readOnly}
        />
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default FormField;
