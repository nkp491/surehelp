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
    const ROW_HEIGHT = FIELD_HEIGHT + GRID_SIZE;
    
    // Calculate position based on index within the section
    const row = Math.floor(fieldIndex / 2);
    const col = fieldIndex % 2;
    
    const x = col * (GRID_SIZE + 400) + GRID_SIZE; // 400px is base width for fields
    const y = row * ROW_HEIGHT + SECTION_PADDING;
    
    return { x, y };
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      <div className="bg-[#3B82F6] text-white px-4 py-2 rounded-t-lg font-medium text-sm">
        {title}
      </div>
      <div className="p-4 relative min-h-[200px]">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((field, fieldIndex) => {
            const position = fieldPositions[field.id] || {};
            const initialPosition = calculateInitialPosition(fieldIndex);
            
            return (
              <div key={field.id} className="relative">
                <DraggableField
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
                    position: 'relative',
                    transform: 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormSection;