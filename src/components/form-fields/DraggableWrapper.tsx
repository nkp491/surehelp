import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { CSSProperties } from "react";

interface DraggableWrapperProps {
  id: string;
  children: React.ReactNode;
}

const DraggableWrapper = ({ id, children }: DraggableWrapperProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: transition + ', border-color 0.2s ease-in-out',
    opacity: isDragging ? 0.6 : 1,
    position: isDragging ? 'relative' as const : 'static' as const,
    zIndex: isDragging ? 1 : 'auto',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative bg-white rounded-lg p-4 border shadow-sm transition-all duration-200
        ${isDragging ? 'ring-2 ring-primary ring-offset-2 cursor-grabbing' : 'hover:border-primary/50'}
        ${isDragging ? 'scale-105' : 'scale-100'}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="absolute right-2 top-2 cursor-grab hover:text-primary transition-colors duration-200"
      >
        <GripVertical className="h-5 w-5" />
      </div>
      {children}
    </div>
  );
};

export default DraggableWrapper;