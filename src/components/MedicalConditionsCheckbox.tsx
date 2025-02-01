import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { medicalConditionsTranslations } from "@/utils/translations";

interface MedicalConditionsCheckboxProps {
  selectedConditions: string[];
  onChange: (conditions: string[]) => void;
}

const CONDITIONS = [
  { id: "heartAttack", label: "heart-attack" },
  { id: "stroke", label: "stroke" },
  { id: "tia", label: "tia" },
  { id: "stent", label: "stent" },
  { id: "diabetesPill", label: "diabetes-pill" },
  { id: "hbp", label: "hbp" },
  { id: "cholesteral", label: "cholesterol" },
  { id: "cancer", label: "cancer" },
  { id: "diabetesInsulin", label: "diabetes-insulin" },
  { id: "asthma", label: "asthma" },
  { id: "copd", label: "copd" },
  { id: "thyroid", label: "thyroid" },
  { id: "anxiety", label: "anxiety" },
  { id: "depression", label: "depression" },
  { id: "alzheimers", label: "alzheimers" },
  { id: "dementia", label: "dementia" },
];

const MedicalConditionsCheckbox = ({
  selectedConditions = [],
  onChange,
}: MedicalConditionsCheckboxProps) => {
  const { language } = useLanguage();
  const mc = medicalConditionsTranslations[language];

  const handleCheckboxChange = (condition: string, checked: boolean) => {
    if (checked) {
      onChange([...(selectedConditions || []), condition]);
    } else {
      onChange((selectedConditions || []).filter((c) => c !== condition));
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">
        {language === 'en' ? 'Medical Condition' : 'Condición Médica'}
      </Label>
      <div className="grid grid-cols-4 gap-x-8 gap-y-3">
        {CONDITIONS.map(({ id, label }) => (
          <div key={id} className="flex items-center space-x-2">
            <Checkbox
              id={id}
              checked={(selectedConditions || []).includes(id)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(id, checked as boolean)
              }
              className="rounded-sm border-gray-400"
            />
            <Label
              htmlFor={id}
              className="text-sm font-normal leading-none text-gray-700"
            >
              {mc[label]}
            </Label>
          </div>
        ))}
        <div className="col-span-4 mt-2">
          <Label className="text-sm font-normal text-gray-700">
            {language === 'en' ? 'Other:' : 'Otro:'}
          </Label>
          <input
            type="text"
            className="mt-1 w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalConditionsCheckbox;