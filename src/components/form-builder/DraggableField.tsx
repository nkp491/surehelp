import React, { useEffect, useRef } from "react";
import DraggableFormField from "../DraggableFormField";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import FieldTypeLabel from "./FieldTypeLabel";
import { useDragConfig } from "./useDragConfig";
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
  width = "100%",
  height = "auto",
  alignment = "left",
  onSelect,
  isSelected,
  style = {},
}: DraggableFieldProps) => {
  const { isEditMode } = useFormBuilder();
  const elementRef = useRef<HTMLDivElement>(null);
  const { initDragAndResize } = useDragConfig(elementRef, isEditMode, id, isSelected);

  useEffect(() => {
    if (elementRef.current) {
      initDragAndResize();
    }
  }, [initDragAndResize]);

  const combinedStyle = {
    ...style,
    width,
    height,
    textAlign: alignment as "left" | "center" | "right",
    position: "relative" as const,
    touchAction: "none",
    transition: "all 0.2s ease-out",
    minHeight: "40px",
    maxHeight: "100px",
  };

  return (
    <div
      ref={elementRef}
      style={combinedStyle}
      className={`form-field-container group ${
        isSelected ? 'ring-1 ring-primary shadow-sm' : 'shadow-none hover:shadow-sm'
      }`}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onSelect();
      }}
      data-field-id={id}
    >
      {isEditMode && (
        <>
          <div className="absolute -top-6 left-0">
            <FieldTypeLabel fieldType={fieldType} />
          </div>
          
          <div 
            className="absolute -left-6 top-0 bottom-0 flex items-center justify-center w-6 h-full cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
            data-drag-handle
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary cursor-nw-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="nw" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary cursor-ne-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="ne" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary cursor-sw-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="sw" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary cursor-se-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="se" />
          </div>
        </>
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