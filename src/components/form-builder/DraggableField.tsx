import React, { useEffect, useRef } from "react";
import interact from "interactjs";
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
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current || !isEditMode) return;

    const position = { x: 0, y: 0 };

    const interactable = interact(elementRef.current)
      .draggable({
        inertia: false,
        modifiers: [
          interact.modifiers.snap({
            targets: [
              interact.snappers.grid({ x: 32, y: 32 })
            ],
            range: 20,
            relativePoints: [{ x: 0, y: 0 }]
          }),
        ],
        listeners: {
          move: (event) => {
            position.x += event.dx;
            position.y += event.dy;

            if (event.target) {
              event.target.style.transform = 
                `translate(${snapToGrid(position.x)}px, ${snapToGrid(position.y)}px)`;
            }
          }
        }
      })
      .resizable({
        edges: { left: true, right: true, bottom: true, top: true },
        modifiers: [
          interact.modifiers.snap({
            targets: [
              interact.snappers.grid({ x: 32, y: 32 })
            ],
            range: 20,
            relativePoints: [{ x: 0, y: 0 }]
          }),
        ],
        listeners: {
          move: (event) => {
            let { x, y } = event.target.dataset;
            
            x = (parseFloat(x) || 0) + event.deltaRect.left;
            y = (parseFloat(y) || 0) + event.deltaRect.top;

            Object.assign(event.target.style, {
              width: `${snapToGrid(event.rect.width)}px`,
              height: `${snapToGrid(event.rect.height)}px`,
              transform: `translate(${snapToGrid(x)}px, ${snapToGrid(y)}px)`
            });

            Object.assign(event.target.dataset, { x, y });
          }
        }
      });

    return () => {
      interactable.unset();
    };
  }, [isEditMode]);

  const combinedStyle = {
    ...style,
    width,
    height,
    textAlign: alignment as "left" | "center" | "right",
    position: "absolute" as const,
    touchAction: "none",
  };

  return (
    <div
      ref={elementRef}
      style={combinedStyle}
      className={`form-field-container ${isSelected ? 'form-field-selected' : ''}`}
      onClick={(e) => {
        if (!isEditMode) return;
        e.stopPropagation();
        onSelect();
      }}
      data-x="0"
      data-y="0"
      data-resize={isEditMode ? "all" : undefined}
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