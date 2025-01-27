import { GripVertical } from "lucide-react";

interface FieldTypeLabelProps {
  fieldType: string;
}

const FieldTypeLabel = ({ fieldType }: FieldTypeLabelProps) => {
  return (
    <div className="absolute -top-2 -right-2 flex gap-1 items-center">
      <div className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0.5 rounded-full shadow-sm">
        {fieldType}
      </div>
      <div className="bg-primary text-primary-foreground p-0.5 rounded-full cursor-move shadow-sm">
        <GripVertical className="h-3 w-3" />
      </div>
    </div>
  );
};

export default FieldTypeLabel;