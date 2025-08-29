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
    <div className="space-y-2 min-h-[80px] flex flex-col justify-start">
      <Label className="text-sm font-medium text-gray-700 flex-shrink-0">
        Height
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex-1 flex flex-col justify-center">
        <div className="flex gap-2 items-center">
          <div className="w-16">
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
              className="h-9 px-2 text-sm bg-gray-50 transition-all duration-200"
              required={required}
              readOnly={readOnly}
            />
          </div>
          <span className="text-sm">ft</span>
          <div className="w-16">
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
              className="h-9 px-2 text-sm bg-gray-50 transition-all duration-200"
              required={required}
              readOnly={readOnly}
            />
          </div>
          <span className="text-sm">in</span>
        </div>
        {error && <p className="text-sm text-red-500 mt-1 flex-shrink-0">{error}</p>}
      </div>
    </div>
  );
};

export default HeightField;