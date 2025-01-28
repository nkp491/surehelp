import React from "react";
import HeightField from "./form-fields/HeightField";
import CurrencyField from "./form-fields/CurrencyField";
import SelectField from "./form-fields/SelectField";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

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
  submissionId?: string;
}

const FormField = ({
  label,
  type,
  value = "",
  onChange,
  placeholder,
  required = false,
  error,
  readOnly = false,
  options = [],
  submissionId,
}: FormFieldProps) => {
  if (type === "height") {
    return <HeightField value={value} onChange={onChange} required={required} error={error} />;
  }

  if (type === "currency") {
    return <CurrencyField label={label} value={value} onChange={onChange} required={required} error={error} />;
  }

  if (type === "select" && options.length > 0) {
    return <SelectField label={label} value={value} onChange={onChange} options={options} required={required} error={error} />;
  }

  if (type === "yes_no") {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <RadioGroup
          value={value}
          onValueChange={onChange}
          className="flex items-center gap-4"
        >
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="yes" id={`${label}-yes`} className="h-3.5 w-3.5" />
            <Label htmlFor={`${label}-yes`} className="text-sm font-normal text-gray-600">Yes</Label>
          </div>
          <div className="flex items-center gap-1.5">
            <RadioGroupItem value="no" id={`${label}-no`} className="h-3.5 w-3.5" />
            <Label htmlFor={`${label}-no`} className="text-sm font-normal text-gray-600">No</Label>
          </div>
        </RadioGroup>
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="space-y-1">
        <Label className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="min-h-[80px] bg-gray-50 resize-none text-sm"
          required={required}
          readOnly={readOnly}
        />
        {error && <p className="text-sm text-red-500">{error}</p>}
      </div>
    );
  }

  const inputClassName = type === "age" ? "h-8 bg-gray-50 w-[100px] text-sm" : "h-8 bg-gray-50 text-sm";

  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        required={required}
        readOnly={readOnly}
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FormField;