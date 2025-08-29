import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  const translatedLabel =
    (t as Record<string, string>)[label.toLowerCase()] || label;
  const translatedPlaceholder = placeholder
    ? (t as Record<string, string>)[placeholder.toLowerCase()] || placeholder
    : undefined;

  return (
    <div className="space-y-2 min-h-[80px] flex flex-col justify-start">
      <Label className="text-sm font-medium text-gray-700 flex-shrink-0">
        {translatedLabel}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <div className="flex-1 flex flex-col justify-center">
        <Select value={value} onValueChange={onChange} disabled={readOnly}>
          <SelectTrigger
            className={cn(
              "h-11 bg-gray-50 transition-all duration-200",
              error ? "border-destructive" : "border-input"
            )}
          >
            <SelectValue placeholder={translatedPlaceholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => {
              const translatedOption =
                (t as Record<string, string>)[option.toLowerCase()] || option;
              return (
                <SelectItem key={option} value={option}>
                  {translatedOption}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        {error && (
          <p className="text-sm text-destructive mt-1 flex-shrink-0">{error}</p>
        )}
      </div>
    </div>
  );
};

export default SelectField;
