import { GripVertical } from "lucide-react";

interface FieldTypeLabelProps {
  fieldType: string;
}

const FieldTypeLabel = ({ fieldType }: FieldTypeLabelProps) => {
  return (
    <div className="absolute -top-3 -right-3 flex gap-2">
      <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
        {fieldType}
      </div>
      <div className="bg-primary text-primary-foreground p-1 rounded-full cursor-move shadow-sm">
        <GripVertical className="h-4 w-4" />
      </div>
    </div>
  );
};

export default FieldTypeLabel;