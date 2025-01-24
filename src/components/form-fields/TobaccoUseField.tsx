import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";

interface TobaccoUseFieldProps {
  value: string;
  onChange: (value: string) => void;
}

const TobaccoUseField = ({ value, onChange }: TobaccoUseFieldProps) => {
  return (
    <div className="space-y-2">
      <Label>Tobacco Use</Label>
      <RadioGroup
        value={value}
        onValueChange={onChange}
        className="flex items-center space-x-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="yes" id="yes" />
          <Label htmlFor="yes" className="text-sm">Yes</Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="no" id="no" />
          <Label htmlFor="no" className="text-sm">No</Label>
        </div>
      </RadioGroup>
    </div>
  );
};

export default TobaccoUseField;