import { FormField } from "@/types/formTypes";
import DraggableField from "./DraggableField";
import { useFormBuilder } from "@/contexts/FormBuilderContext";

interface DragDropAreaProps {
  fields: FormField[];
  fieldPositions: Record<string, any>;
  formData: any;
  setFormData: (value: any) => void;
  selectedField: string | null;
  setSelectedField: (fieldId: string | null) => void;
}

const DragDropArea = ({
  fields,
  fieldPositions,
  formData,
  setFormData,
  selectedField,
  setSelectedField,
}: DragDropAreaProps) => {
  const { isEditMode } = useFormBuilder();
  
  return (
    <div className="flex justify-center w-full py-8">
      <div 
        className={`relative w-[1056px] h-[816px] rounded-lg p-8 transition-all duration-200 ${
          isEditMode ? 'bg-grid edit-mode' : 'bg-white'
        }`}
        style={{
          border: isEditMode ? '1px dashed #ccc' : 'none',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        }}
        onClick={() => setSelectedField(null)}
      >
        {fields.map((field) => {
          const position = fieldPositions[field.id] || {};
          const defaultX = fields.indexOf(field) * 32;
          const defaultY = Math.floor(fields.indexOf(field) / 2) * 200;
          
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
              width={position.width || "320px"}
              height={position.height || "auto"}
              alignment={position.alignment || "left"}
              onSelect={() => setSelectedField(field.id)}
              isSelected={selectedField === field.id}
              style={{
                transform: `translate3d(${position.x_position || defaultX}px, ${position.y_position || defaultY}px, 0)`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

export default DragDropArea;