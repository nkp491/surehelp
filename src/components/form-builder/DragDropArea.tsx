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
  
  // Calculate initial positions in a grid layout
  const calculateInitialPosition = (index: number) => {
    const GRID_SIZE = 32;
    const FIELD_WIDTH = 320;
    const FIELD_HEIGHT = 120;
    const GRID_WIDTH = 2400; // Increased width to prevent cutoff
    const GRID_HEIGHT = 1200;
    
    // Calculate optimal number of columns based on grid width
    const columns = Math.floor((GRID_WIDTH - GRID_SIZE) / (FIELD_WIDTH + GRID_SIZE));
    
    // Calculate optimal number of rows based on total fields
    const totalRows = Math.ceil(fields.length / columns);
    
    // Calculate vertical spacing to distribute fields evenly
    const verticalSpacing = Math.min(
      FIELD_HEIGHT + GRID_SIZE,
      Math.floor((GRID_HEIGHT - GRID_SIZE) / totalRows)
    );
    
    // Calculate row and column for the current field
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    // Calculate x and y positions with proper spacing
    const x = col * (FIELD_WIDTH + GRID_SIZE) + GRID_SIZE;
    const y = row * verticalSpacing + GRID_SIZE;
    
    return { x, y };
  };
  
  return (
    <div className="flex justify-center w-full py-8 overflow-x-auto">
      <div 
        className={`relative w-[2400px] h-[1200px] rounded-lg p-8 overflow-hidden transition-all duration-200 ${
          isEditMode ? 'bg-grid edit-mode' : 'bg-white'
        }`}
        style={{
          border: isEditMode ? '1px dashed #ccc' : 'none',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
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
              width={position.width || "320px"}
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