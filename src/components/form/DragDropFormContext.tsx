import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  sortableKeyboardCoordinates,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { FormField } from "@/types/formTypes";

interface DragDropFormContextProps {
  children: React.ReactNode;
  sections: { section: string; fields: FormField[] }[];
  setSections: React.Dispatch<React.SetStateAction<{ section: string; fields: FormField[] }[]>>;
}

const DragDropFormContext = ({ children, sections, setSections }: DragDropFormContextProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const allFields = sections.flatMap(section => section.fields);
      const newFields = arrayMove(
        allFields,
        allFields.findIndex(item => item.id === active.id),
        allFields.findIndex(item => item.id === over.id)
      );
      
      const newSections = sections.map(section => ({
        ...section,
        fields: newFields.filter(field => 
          section.fields.some(originalField => originalField.id === field.id)
        )
      }));
      
      setSections(newSections);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.flatMap(section => section.fields).map(field => field.id)}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
};

export default DragDropFormContext;