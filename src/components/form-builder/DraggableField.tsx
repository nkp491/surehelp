import React, { useEffect, useRef } from "react";
import DraggableFormField from "../DraggableFormField";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import FieldTypeLabel from "./FieldTypeLabel";
import { useDragConfig } from "./useDragConfig";

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
  width = "200px",
  height = "auto",
  alignment = "left",
  onSelect,
  isSelected,
  style = {},
}: DraggableFieldProps) => {
  const { isEditMode } = useFormBuilder();
  const elementRef = useRef<HTMLDivElement>(null);
  const { initializeDragAndResize } = useDragConfig(elementRef, isEditMode);

  useEffect(() => {
    const cleanup = initializeDragAndResize();
    return cleanup;
  }, [isEditMode]);

  const combinedStyle = {
    ...style,
    width,
    height,
    textAlign: alignment as "left" | "center" | "right",
    position: "absolute" as const,
    touchAction: "none",
    transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out",
    minHeight: "40px", // Further reduced minimum height
    maxHeight: "100px", // Further reduced maximum height
  };

  return (
    <div
      ref={elementRef}
      style={combinedStyle}
      className={`form-field-container ${
        isSelected ? 'ring-1 ring-primary shadow-sm' : 'shadow-none hover:shadow-sm'
      } ${isEditMode ? 'cursor-move' : ''}`}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onSelect();
      }}
      data-x="0"
      data-y="0"
      data-resize={isEditMode ? "all" : undefined}
    >
      {isEditMode && <FieldTypeLabel fieldType={fieldType} />}
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