
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";

interface EmploymentStatusCheckboxProps {
  selectedStatus: string[];
  onChange: (status: string[]) => void;
}

const EMPLOYMENT_STATUS = {
  en: {
    Retired: "Retired",
    Employed: "Employed",
    Unemployed: "Unemployed",
    Disabled: "Disabled"
  },
  es: {
    Retired: "Jubilado",
    Employed: "Empleado",
    Unemployed: "Desempleado",
    Disabled: "Discapacitado"
  }
};

const EmploymentStatusCheckbox = ({
  selectedStatus = [],
  onChange,
}: EmploymentStatusCheckboxProps) => {
  const { language } = useLanguage();
  const statuses = Object.keys(EMPLOYMENT_STATUS.en);

  const handleCheckboxChange = (status: string, checked: boolean) => {
    const currentStatus = selectedStatus || [];
    if (checked) {
      onChange([...currentStatus, status]);
    } else {
      onChange(currentStatus.filter((s) => s !== status));
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-sm font-semibold text-gray-700">
        {language === 'en' ? 'Employment Status' : 'Estado Laboral'}
      </Label>
      <div className="grid grid-cols-2 gap-4">
        {statuses.map((status) => (
          <div key={status} className="flex items-center space-x-2">
            <Checkbox
              id={status}
              checked={(selectedStatus || []).includes(status)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(status, checked as boolean)
              }
            />
            <Label
              htmlFor={status}
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {EMPLOYMENT_STATUS[language][status]}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmploymentStatusCheckbox;
