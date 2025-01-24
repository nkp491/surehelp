import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import DraggableFormField from "../DraggableFormField";

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
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    width: width || "auto",
    height: height || "auto",
    textAlign: alignment as "left" | "center" | "right",
    border: isSelected ? "2px solid #2563eb" : "none",
    padding: "8px",
    cursor: "move",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={(e) => {
        e.stopPropagation();
        onSelect();
      }}
    >
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