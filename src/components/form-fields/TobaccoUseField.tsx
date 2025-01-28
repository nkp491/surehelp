import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface TobaccoUseFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const TobaccoUseField = ({ value, onChange }: TobaccoUseFieldProps) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">Tobacco Use</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex items-center gap-6"
      >
        <div className="flex items-center gap-2">
          <RadioGroupItem value="yes" id="yes" className="h-4 w-4" />
          <Label htmlFor="yes" className="text-sm font-normal text-gray-600">Yes</Label>
        </div>
        <div className="flex items-center gap-2">
          <RadioGroupItem value="no" id="no" className="h-4 w-4" />
          <Label htmlFor="no" className="text-sm font-normal text-gray-600">No</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TobaccoUseField;