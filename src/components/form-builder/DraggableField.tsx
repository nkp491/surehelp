import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import DraggableFormField from "../DraggableFormField";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { GripVertical } from "lucide-react";

interface DraggableFieldProps {
  id: string;
  fieldType: string;
  label: string;
  value: any;
  onChange: (value: any) => void;
  width?: string;
  height?: string;
  alignment?: string;
  onSelect: () => void;
  isSelected: boolean;
  style?: React.CSSProperties;
}

const DraggableField = ({
  id,
  fieldType,
  label,
  value,
  onChange,
  width = "320px",
  height = "auto",
  alignment = "left",
  onSelect,
  isSelected,
  style = {},
}: DraggableFieldProps) => {
  const { isEditMode } = useFormBuilder();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    disabled: !isEditMode,
  });

  const combinedStyle = {
    ...style,
    transform: CSS.Transform.toString(transform),
    width: width,
    height: height,
    textAlign: alignment as "left" | "center" | "right",
    position: "absolute" as const,
    touchAction: "none",
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      className={`form-field-container ${isSelected ? 'form-field-selected' : ''}`}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onSelect();
      }}
    >
      {isEditMode && (
        <div className="absolute -top-3 -right-3 flex gap-2">
          <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
            {fieldType}
          </div>
          <div className="bg-primary text-primary-foreground p-1 rounded-full cursor-move shadow-sm">
            <GripVertical className="h-4 w-4" />
          </div>
        </div>
      )}
      <DraggableFormField
        id={id}
        fieldType={fieldType}
        label={label}
        value={value}
        onChange={onChange}
      />
    </div>
  );
};

export default DraggableField;