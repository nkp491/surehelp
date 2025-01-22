import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MedicalConditionsCheckboxProps {
  selectedConditions: string[];
  onChange: (conditions: string[]) => void;
}

const CONDITIONS = [
  "Heart Attack",
  "Stroke",
  "TIA",
  "Stent",
  "Diabetes",
  "HBP",
  "Cholesterol",
  "Cancer",
  "Astma",
  "COPD",
  "Thyroid",
  "Anxiety",
  "Depression",
  "Alzheimer's",
  "Dementia"
];

const MedicalConditionsCheckbox = ({
  selectedConditions = [], // Add default empty array
  onChange,
}: MedicalConditionsCheckboxProps) => {
  const handleCheckboxChange = (condition: string, checked: boolean) => {
    if (checked) {
      onChange([...(selectedConditions || []), condition]);
    } else {
      onChange((selectedConditions || []).filter((c) => c !== condition));
    }
  };

  return (
    <div className="space-y-4">
      <Label className="text-base font-semibold">Medical Conditions</Label>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CONDITIONS.map((condition) => (
          <div key={condition} className="flex items-center space-x-2">
            <Checkbox
              id={condition}
              checked={(selectedConditions || []).includes(condition)}
              onCheckedChange={(checked) =>
                handleCheckboxChange(condition, checked as boolean)
              }
            />
            <Label
              htmlFor={condition}
              className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {condition}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MedicalConditionsCheckbox;