import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface MedicalConditionsCheckboxProps {
  selectedConditions: string[];
  onChange: (conditions: string[]) => void;
}

const CONDITIONS = [
  { id: "heartAttack", label: "Heart Attack" },
  { id: "stroke", label: "Stroke" },
  { id: "tia", label: "TIA" },
  { id: "stent", label: "Stent" },
  { id: "diabetesPill", label: "Diabetes: Pill" },
  { id: "hbp", label: "HBP" },
  { id: "cholesteral", label: "Cholesteral" },
  { id: "cancer", label: "Cancer" },
  { id: "diabetesInsulin", label: "Diabetes: Insulin" },
  { id: "asthma", label: "Asthma" },
  { id: "copd", label: "COPD" },
  { id: "thyroid", label: "Thyroid" },
  { id: "anxiety", label: "Anxiety" },
  { id: "depression", label: "Depression" },
  { id: "alzheimers", label: "Alzheimer's" },
  { id: "dementia", label: "Dementia" },
];

const MedicalConditionsCheckbox = ({
  selectedConditions = [],
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
      <Label className="text-base font-medium">Medical Condition</Label>
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
              {label}
            </Label>
          </div>
        ))}
        <div className="col-span-4 mt-2">
          <Label className="text-sm font-normal text-gray-700">Other:</Label>
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