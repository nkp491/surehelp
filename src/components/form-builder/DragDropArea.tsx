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
  
  const calculateInitialPosition = (index: number) => {
    const GRID_SIZE = 24;
    const FIELD_WIDTH = 280;
    const FIELD_HEIGHT = 100;
    const GRID_WIDTH = 3200;
    const GRID_HEIGHT = 1200;
    
    const columns = Math.floor((GRID_WIDTH - GRID_SIZE) / (FIELD_WIDTH + GRID_SIZE));
    const totalRows = Math.ceil(fields.length / columns);
    const verticalSpacing = Math.min(
      FIELD_HEIGHT + GRID_SIZE,
      Math.floor((GRID_HEIGHT - GRID_SIZE) / totalRows)
    );
    
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    const x = col * (FIELD_WIDTH + GRID_SIZE) + GRID_SIZE;
    const y = row * verticalSpacing + GRID_SIZE;
    
    return { x, y };
  };
  
  return (
    <div className="flex justify-center w-full overflow-x-auto">
      <div 
        className={`relative w-[3200px] h-[1200px] rounded-lg overflow-hidden transition-all duration-200 ${
          isEditMode ? 'bg-grid edit-mode' : 'bg-white'
        }`}
        style={{
          boxShadow: isEditMode ? '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' : 'none'
        }}
        onClick={() => setSelectedField(null)}
      >
        {fields.map((field, index) => {
          const position = fieldPositions[field.id] || {};
          const initialPosition = calculateInitialPosition(index);
          
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
              width={position.width || "280px"}
              height={position.height || "auto"}
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

export default DragDropArea;