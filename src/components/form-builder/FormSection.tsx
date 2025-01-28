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
    const FIELD_WIDTH = 208;
    const FIELD_HEIGHT = 48;
    const SECTION_PADDING = 64;
    
    const columnsPerRow = 2;
    const column = fieldIndex % columnsPerRow;
    const row = Math.floor(fieldIndex / columnsPerRow);
    
    const x = column * (FIELD_WIDTH + GRID_SIZE * 2) + GRID_SIZE * 2;
    const y = (row * (FIELD_HEIGHT + GRID_SIZE * 2) + GRID_SIZE * 2) + (sectionIndex * SECTION_PADDING);
    
    return { x, y };
  };

  return (
    <div className="relative">
      <h3 
        className="absolute text-sm font-medium text-gray-500 px-2 py-1 bg-white/80 rounded-sm shadow-sm" 
        style={{ top: sectionIndex * 64, left: 8 }}
      >
        {title}
      </h3>
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
            width={position.width || "208px"}
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
  );
};

export default FormSection;