import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

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
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
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
      {children}
    </div>
  );
};

export default DraggableWrapper;