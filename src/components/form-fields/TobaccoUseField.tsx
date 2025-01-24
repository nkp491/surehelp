import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface TobaccoUseFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const TobaccoUseField = ({ value, onChange }: TobaccoUseFieldProps) => {
  return (
    <div className="space-y-1">
      <Label className="text-sm font-medium">Tobacco Use</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex items-center space-x-4 mt-1"
      >
        <div className="flex items-center space-x-1.5">
          <RadioGroupItem value="yes" id="yes" className="h-4 w-4" />
          <Label htmlFor="yes" className="text-sm">Yes</Label>
        </div>
        <div className="flex items-center space-x-1.5">
          <RadioGroupItem value="no" id="no" className="h-4 w-4" />
          <Label htmlFor="no" className="text-sm">No</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TobaccoUseField;