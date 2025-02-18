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
    const currentSelected = Array.isArray(selectedConditions) ? selectedConditions : [];
    
    if (checked) {
      onChange([...currentSelected, condition]);
    } else {
      onChange(currentSelected.filter((c) => c !== condition));
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-medium">
        {language === 'en' ? 'Medical Condition' : 'Condición Médica'}
      </Label>
      <div className="grid grid-cols-4 gap-x-8 gap-y-3">
        {CONDITIONS.map((condition) => (
          <div key={condition.id} className="flex items-center space-x-2">
            <Checkbox
              id={condition.id}
              checked={Array.isArray(selectedConditions) && selectedConditions.includes(condition.id)}
              onCheckedChange={(checked) => handleCheckboxChange(condition.id, checked as boolean)}
            />
            <Label htmlFor={condition.id} className="text-sm font-normal">
              {mc[condition.label]}
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