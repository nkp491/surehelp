import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";

interface TextFieldProps {
  label: string;
  type: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  readOnly?: boolean;
  className?: string;
  submissionId?: string;
}

const TextField = ({
  label,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  error,
  readOnly = false,
  className,
  submissionId,
}: TextFieldProps) => {
  const { language } = useLanguage();
  const t = translations[language];

  const inputClasses = cn(
    "w-full bg-gray-50 border-gray-200 rounded-md text-sm",
    error && "border-red-500",
    className
  );

  // Translate the label if it exists in translations
  const translatedLabel = (t as any)[label.toLowerCase()] || label;
  const translatedPlaceholder = placeholder ? (t as any)[placeholder.toLowerCase()] || placeholder : undefined;

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">
        {translatedLabel}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      {type === "textarea" ? (
        <Textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={translatedPlaceholder}
          className={inputClasses}
          required={required}
          readOnly={readOnly}
        />
      ) : (
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={translatedPlaceholder}
          className={inputClasses}
          required={required}
          readOnly={readOnly}
        />
      )}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TextField;