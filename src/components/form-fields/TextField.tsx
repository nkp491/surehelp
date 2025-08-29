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
    "w-full bg-gray-50 border-gray-200 rounded-md text-sm transition-all duration-200",
    error && "border-red-500",
    className
  );

  // Translate the label if it exists in translations
  const translatedLabel =
    (t as Record<string, string>)[label.toLowerCase()] || label;
  const translatedPlaceholder = placeholder
    ? (t as Record<string, string>)[placeholder.toLowerCase()] || placeholder
    : undefined;

  return (
    <div className="space-y-2 min-h-[80px] flex flex-col justify-start">
      <Label className="text-sm font-medium text-gray-700 flex-shrink-0">
        {translatedLabel}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <div className="flex-1 flex flex-col justify-center">
        {type === "textarea" ? (
          <Textarea
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={translatedPlaceholder}
            className={cn(inputClasses, "min-h-[100px] resize-none")}
            required={required}
            readOnly={readOnly}
          />
        ) : (
          <Input
            type={type}
            value={value}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={translatedPlaceholder}
            className={cn(inputClasses, "h-11")}
            required={required}
            readOnly={readOnly}
          />
        )}
        {error && (
          <p className="text-sm text-red-500 mt-1 flex-shrink-0">{error}</p>
        )}
      </div>
    </div>
  );
};

export default TextField;
