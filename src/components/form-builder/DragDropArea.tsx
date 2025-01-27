import { FormField } from "@/types/formTypes";
import DraggableField from "./DraggableField";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";

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
  const { showSpouse } = useSpouseVisibility();
  
  const calculateInitialPosition = (index: number) => {
    const GRID_SIZE = 12;
    const FIELD_WIDTH = 200;
    const FIELD_HEIGHT = 70;
    const GRID_WIDTH = 1920;
    const GRID_HEIGHT = 1080;
    
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

  // Filter out spouse fields if spouse toggle is off
  const visibleFields = fields.filter(field => {
    const isSpouseField = field.id.toLowerCase().includes('spouse');
    return showSpouse ? true : !isSpouseField;
  });
  
  return (
    <div className="w-full overflow-auto">
      <div 
        className={`relative w-[1920px] h-[1080px] rounded-lg overflow-hidden transition-all duration-200 ${
          isEditMode ? 'bg-grid edit-mode' : 'bg-white'
        }`}
        style={{
          boxShadow: isEditMode ? '0 1px 2px rgb(0 0 0 / 0.05)' : 'none'
        }}
        onClick={() => setSelectedField(null)}
      >
        {visibleFields.map((field, index) => {
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
              width={position.width || "200px"}
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