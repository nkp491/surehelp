
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";

type FormFieldProps = {
  label: string;
  type: "text" | "email" | "date";
  value: string | Date | null;
  onChange: (value: string | Date | null) => void;
  isEditing: boolean;
  required?: boolean;
};

const FormField = ({ label, type, value, onChange, isEditing, required = false }: FormFieldProps) => {
  const formatDateValue = (dateValue: string | Date | null) => {
    if (!dateValue) return "-";
    return new Date(dateValue).toLocaleDateString();
  };
  
  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="space-y-2.5">
      <Label className="text-sm font-medium text-gray-700">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      
      {isEditing ? (
        type === "date" ? (
          <DatePicker
            selected={value instanceof Date ? value : value ? new Date(value) : null}
            onSelect={(date) => onChange(date)}
            maxDate={new Date()}
          />
        ) : (
          <Input
            type={type}
            value={typeof value === "string" ? value : ""}
            onChange={handleTextChange}
            className="w-full"
          />
        )
      ) : (
        <p className="text-base text-gray-900 pt-1">
          {type === "date" ? formatDateValue(value) : (value || "-")}
        </p>
      )}
    </div>
  );
};

export default FormField;
