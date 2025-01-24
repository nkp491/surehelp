import React, { useState, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import DraggableFormField from "../DraggableFormField";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { GripVertical } from "lucide-react";
import { snapToGrid } from "@/utils/gridUtils";

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
  onResize?: (width: string) => void;
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
  onResize,
}: DraggableFieldProps) => {
  const { isEditMode } = useFormBuilder();
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    disabled: !isEditMode,
  });

  const [isResizing, setIsResizing] = useState(false);
  const fieldRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef<number>(0);
  const startWidthRef = useRef<number>(0);

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    startXRef.current = e.clientX;
    startWidthRef.current = fieldRef.current?.offsetWidth || 0;

    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const deltaX = e.clientX - startXRef.current;
    const newWidth = startWidthRef.current + deltaX;
    const snappedWidth = snapToGrid(newWidth);
    
    if (fieldRef.current) {
      fieldRef.current.style.width = `${snappedWidth}px`;
    }
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);

    if (fieldRef.current && onResize) {
      const snappedWidth = snapToGrid(fieldRef.current.offsetWidth);
      onResize(`${snappedWidth}px`);
    }
  };

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
      ref={(node) => {
        setNodeRef(node);
        if (fieldRef) fieldRef.current = node;
      }}
      style={combinedStyle}
      className={`form-field-container relative ${isSelected ? 'form-field-selected' : ''}`}
      {...(isEditMode ? { ...attributes, ...listeners } : {})}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onSelect();
      }}
    >
      {isEditMode && (
        <>
          <div className="absolute -top-3 -right-3 flex gap-2">
            <div className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full shadow-sm">
              {fieldType}
            </div>
            <div className="bg-primary text-primary-foreground p-1 rounded-full cursor-move shadow-sm">
              <GripVertical className="h-4 w-4" />
            </div>
          </div>
          {/* Resize handle */}
          <div
            className="absolute bottom-0 right-0 w-3 h-3 cursor-se-resize bg-primary rounded-bl"
            onMouseDown={handleResizeStart}
          />
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