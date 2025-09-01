import React from "react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

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
  const { language } = useLanguage();
  const t = translations[language];

  // Translate the label if it exists in translations
  const translatedLabel = (t as any)[label.toLowerCase()] || label;
  const translatedPlaceholder = placeholder ? (t as any)[placeholder.toLowerCase()] || placeholder : undefined;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">
        {translatedLabel}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Select
        value={value}
        onValueChange={onChange}
        disabled={readOnly}
      >
        <SelectTrigger className={cn(error ? "border-destructive" : "border-input")}>
          <SelectValue placeholder={translatedPlaceholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => {
            const translatedOption = (t as any)[option.toLowerCase()] || option;
            return (
              <SelectItem key={option} value={option}>
                {translatedOption}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
};

export default SelectField;