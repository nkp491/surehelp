import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import FormField from "./FormField";
import MedicalConditionsCheckbox from "./MedicalConditionsCheckbox";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

interface DraggableFormFieldProps {
  id: string;
  fieldType: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
}

const DraggableFormField = ({
  id,
  fieldType,
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
}: DraggableFormFieldProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const renderField = () => {
    switch (fieldType) {
      case "medicalConditions":
        return (
          <MedicalConditionsCheckbox
            selectedConditions={value}
            onChange={onChange}
          />
        );
      case "tobaccoUse":
        return (
          <div className="space-y-2">
            <Label>Tobacco Use</Label>
            <RadioGroup
              value={value}
              onValueChange={onChange}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="yes" id="yes" />
                <Label htmlFor="yes">Yes</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="no" id="no" />
                <Label htmlFor="no">No</Label>
              </div>
            </RadioGroup>
          </div>
        );
      default:
        return (
          <FormField
            label={label}
            type={fieldType}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            error={error}
          />
        );
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-white rounded-lg p-4 border shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-move hover:text-primary"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      {renderField()}
    </div>
  );
};

export default DraggableFormField;