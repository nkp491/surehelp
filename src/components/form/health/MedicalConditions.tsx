import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { medicalConditionsTranslations } from "@/utils/translations";

interface MedicalConditionsProps {
  formData: any;
  setFormData: (value: any) => void;
}

const medicalConditions = [
  "heart-attack",
  "heart-failure",
  "diabetes-pill",
  "diabetes-insulin",
  "emphysema",
  "kidney-failure",
  "terminal-illness",
  "stroke",
  "tia",
  "hbp",
  "asthma",
  "anxiety",
  "depression",
  "hiv-aids",
  "cardiomyopathy",
  "heart-valve",
  "cholesterol",
  "copd",
  "alzheimers",
  "parkinsons",
  "lupus",
  "stent",
  "bypass",
  "cancer",
  "tumors",
  "thyroid",
  "dementia",
  "als",
];

const MedicalConditions = ({
  formData,
  setFormData,
}: MedicalConditionsProps) => {
  const { language } = useLanguage();
  const mc = medicalConditionsTranslations[language];

  const handleConditionChange = (condition: string, checked: boolean) => {
    const currentConditions = formData.selectedConditions || [];
    const newConditions = checked
      ? [...currentConditions, condition]
      : currentConditions.filter((id: string) => id !== condition);
    setFormData((prev) => ({
      ...prev,
      selectedConditions: newConditions,
    }));
  };

  return (
    <div className="space-y-2">
      <Label>Medical Condition</Label>
      <div className="grid grid-cols-2 gap-2">
        {medicalConditions.map((condition) => (
          <div key={condition} className="flex items-center space-x-2">
            <Checkbox
              id={condition}
              checked={(formData.selectedConditions || []).includes(condition)}
              onCheckedChange={(checked) =>
                handleConditionChange(condition, checked as boolean)
              }
            />
            <Label htmlFor={condition} className="text-sm font-normal">
              {mc[condition]}
            </Label>
          </div>
        ))}
        <div className="flex items-center space-x-2 col-span-1">
          <Checkbox id="other" />
          <Label
            htmlFor="other"
            className="text-sm font-normal whitespace-nowrap"
          >
            Other:
          </Label>
          <input
            className="h-8 border border-gray-200 bg-gray-50 rounded-md w-56 flex-1"
            value={formData.otherConditions || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                otherConditions: e.target.value,
              }))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default MedicalConditions;
