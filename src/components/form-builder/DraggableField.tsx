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
  width = "200px",
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
    position: "absolute" as const,
    touchAction: "none",
    transition: "transform 0.2s ease-out, box-shadow 0.2s ease-out, background-color 0.2s ease-out",
    minHeight: "40px",
    maxHeight: "100px",
  };

  return (
    <div
      ref={elementRef}
      style={combinedStyle}
      className={`form-field-container group relative ${
        isSelected ? 'ring-1 ring-primary shadow-sm' : 'shadow-none hover:shadow-sm'
      }`}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onSelect();
      }}
      data-x="0"
      data-y="0"
      data-resize={isEditMode ? "all" : undefined}
      data-field-id={id}
    >
      {isEditMode && (
        <>
          <div className="absolute -top-6 left-0">
            <FieldTypeLabel fieldType={fieldType} />
          </div>
          
          {/* Drag Handle */}
          <div 
            className="absolute -left-6 top-0 bottom-0 flex items-center justify-center w-6 h-full cursor-move opacity-0 group-hover:opacity-100 transition-opacity"
            data-drag-handle
          >
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>

          {/* Resize Handles */}
          <div className="absolute inset-0 pointer-events-none">
            {/* Corner resize handles */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-primary cursor-nw-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="nw" />
            <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-primary cursor-ne-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="ne" />
            <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-primary cursor-sw-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="sw" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-primary cursor-se-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="se" />
            
            {/* Edge resize handles */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-3 border-t-2 border-primary cursor-n-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="n" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-3 border-b-2 border-primary cursor-s-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="s" />
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-3 h-8 border-l-2 border-primary cursor-w-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="w" />
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-8 border-r-2 border-primary cursor-e-resize pointer-events-auto opacity-0 group-hover:opacity-100" data-resize-handle="e" />
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