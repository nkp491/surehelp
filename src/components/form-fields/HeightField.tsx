import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface HeightFieldProps {
  value: string;
  onChange?: (value: string) => void;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
}

const HeightField = ({
  value,
  onChange,
  required = false,
  error,
  readOnly = false,
}: HeightFieldProps) => {
  const [feet, inches] = (value || "0'0\"").split("'").map(v => v.replace('"', ''));
  
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">
        Height
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex gap-1">
        <div className="w-12">
          <Input
            type="number"
            value={feet || ""}
            onChange={(e) => {
              const newFeet = e.target.value;
              const newInches = inches || "0";
              onChange?.(`${newFeet}'${newInches}"`);
            }}
            placeholder="ft"
            min="0"
            max="9"
            className="h-8 px-1 text-sm"
            required={required}
            readOnly={readOnly}
          />
        </div>
        <div className="w-12">
          <Input
            type="number"
            value={inches || ""}
            onChange={(e) => {
              const newInches = e.target.value;
              const currentFeet = feet || "0";
              onChange?.(`${currentFeet}'${newInches}"`);
            }}
            placeholder="in"
            min="0"
            max="11"
            className="h-8 px-1 text-sm"
            required={required}
            readOnly={readOnly}
          />
        </div>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default HeightField;