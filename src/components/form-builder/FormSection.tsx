import { FormField } from "@/types/formTypes";
import DraggableField from "./DraggableField";

interface FormSectionProps {
  title: string;
  fields: FormField[];
  sectionIndex: number;
  formData: any;
  setFormData: (value: any) => void;
  fieldPositions: Record<string, any>;
  selectedField: string | null;
  setSelectedField: (fieldId: string | null) => void;
}

const FormSection = ({
  title,
  fields,
  sectionIndex,
  formData,
  setFormData,
  fieldPositions,
  selectedField,
  setSelectedField,
}: FormSectionProps) => {
  const calculateInitialPosition = (fieldIndex: number) => {
    const GRID_SIZE = 8;
    const FIELD_HEIGHT = 48;
    const SECTION_PADDING = 16;
    
    const y = (fieldIndex * (FIELD_HEIGHT + GRID_SIZE)) + SECTION_PADDING;
    
    return { x: GRID_SIZE, y };
  };

  return (
    <div className="relative bg-white rounded-lg shadow-sm">
      <div className="bg-[#3B82F6] text-white px-4 py-2 rounded-t-lg font-medium text-sm">
        {title}
      </div>
      <div className="p-4">
        {fields.map((field, fieldIndex) => {
          const position = fieldPositions[field.id] || {};
          const initialPosition = calculateInitialPosition(fieldIndex);
          
          return (
            <DraggableField
              key={field.id}
              id={field.id}
              fieldType={field.type}
              label={field.label}
              value={formData[field.id]}
              onChange={(value) =>
                setFormData((prev: any) => ({ ...prev, [field.id]: value }))
              }
              width={position.width || "100%"}
              height={position.height || "48px"}
              alignment={position.alignment || "left"}
              onSelect={() => setSelectedField(field.id)}
              isSelected={selectedField === field.id}
              style={{
                transform: `translate(${position.x_position || initialPosition.x}px, ${position.y_position || initialPosition.y}px)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default FormSection;