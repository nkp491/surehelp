import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import DraggableFormField from "../DraggableFormField";
import { useFormBuilder } from "@/contexts/FormBuilderContext";

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
}

const DraggableField = ({
  id,
  fieldType,
  label,
  value,
  onChange,
  width,
  height,
  alignment = "left",
  onSelect,
  isSelected,
}: DraggableFieldProps) => {
  const { isEditMode } = useFormBuilder();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    disabled: !isEditMode,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    width: width || "auto",
    height: height || "auto",
    textAlign: alignment as "left" | "center" | "right",
    border: isEditMode && isSelected ? "2px solid #2563eb" : "none",
    padding: "8px",
    cursor: isEditMode ? "move" : "default",
    position: "relative" as const,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onSelect();
      }}
    >
      {isEditMode && (
        <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs px-1 rounded">
          {fieldType}
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