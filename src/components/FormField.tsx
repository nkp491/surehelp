import HeightField from "./form-fields/HeightField";
import CurrencyField from "./form-fields/CurrencyField";
import SelectField from "./form-fields/SelectField";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/utils/translations";
import { cn } from "@/lib/utils";
import { DatePicker } from "./ui/date-picker";
import { parse, isValid, format } from "date-fns";

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
  const { language } = useLanguage();
  const t = translations[language];

  const getTranslatedLabel = (label: string) => {
    const translatedLabel = (t as any)[label];
    if (translatedLabel) return translatedLabel;

    const key = label.toLowerCase().replace(/[^a-zA-Z0-9]/g, "");
    return (t as any)[key] || label;
  };

  const labelClassName = "text-sm font-medium text-gray-700 mb-2";

  if (type === "height") {
    return <HeightField value={value} onChange={onChange} required={required} error={error} />;
  }

  if (type === "currency") {
    return (
      <CurrencyField
        label={getTranslatedLabel(label)}
        value={value}
        onChange={onChange}
        required={required}
        error={error}
      />
    );
  }

  if (type === "select" && options.length > 0) {
    return (
      <SelectField
        label={getTranslatedLabel(label)}
        value={value}
        onChange={onChange}
        options={options}
        required={required}
        error={error}
      />
    );
  }

  if (type === "yes_no") {
    return (
      <div className="relative space-y-2">
        <Label className={labelClassName}>
          {getTranslatedLabel(label)}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <RadioGroup value={value} onValueChange={onChange} className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <RadioGroupItem value="yes" id={`${label}-yes`} className="h-4 w-4" />
            <Label htmlFor={`${label}-yes`} className="text-sm font-normal text-gray-600">
              {t.yes}
            </Label>
          </div>
          <div className="flex items-center gap-2">
            <RadioGroupItem value="no" id={`${label}-no`} className="h-4 w-4" />
            <Label htmlFor={`${label}-no`} className="text-sm font-normal text-gray-600">
              {t.no}
            </Label>
          </div>
        </RadioGroup>
        {error && <p className="text-xs text-red-500 absolute right-0 top-0">{error}</p>}
      </div>
    );
  }

  if (type === "textarea") {
    return (
      <div className="relative space-y-2">
        <Label className={labelClassName}>
          {getTranslatedLabel(label)}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <Textarea
          value={value || ""}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          className="min-h-[100px] bg-gray-50 resize-none text-sm"
          required={required}
          readOnly={readOnly}
        />
        {error && <p className="text-xs text-red-500 absolute right-0 top-0">{error}</p>}
      </div>
    );
  }

  const inputClassName = cn("h-11 bg-gray-50 text-sm", type === "age" && "w-[80px]");

  if (type === "date") {
    const selectedDate =
      value && isValid(parse(value, "MM/dd/yyyy", new Date()))
        ? parse(value, "MM/dd/yyyy", new Date())
        : null;

    return (
      <div className="relative space-y-2">
        <Label className={labelClassName}>
          {getTranslatedLabel(label)}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        <div
          className="cursor-pointer"
          onClick={(e) => {
            // Find the input or button inside and click it
            const input = e.currentTarget.querySelector('input');
            const button = e.currentTarget.querySelector('button');

            if (input) {
              input.focus();
              input.click();
            } else if (button) {
              button.click();
            }
          }}
        >
        <DatePicker
          selected={selectedDate}
          onSelect={(date) => {
            onChange?.(date ? format(date, "MM/dd/yyyy") : "");
          }}
          placeholder={placeholder}
        />
        </div>
        {error && <p className="text-xs text-red-500 absolute right-0 top-0">{error}</p>}
      </div>
    );
  }

  return (
    <div className="relative space-y-2">
      <Label className={labelClassName}>
        {getTranslatedLabel(label)}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        type={type}
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={inputClassName}
        required={required}
        readOnly={readOnly}
      />
      {error && <p className="text-xs text-red-500 absolute right-0 top-0">{error}</p>}
    </div>
  );
};

export default FormField;
