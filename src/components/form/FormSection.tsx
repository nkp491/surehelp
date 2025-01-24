import { FormField } from "@/types/formTypes";
import SectionHeader from "./SectionHeader";
import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useState } from "react";
import DraggableField from "../form-builder/DraggableField";
import FormFieldProperties from "../form-builder/FormFieldProperties";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface FormSectionProps {
  section: string;
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
  onRemove?: () => void;
}

const FormSection = ({
  section,
  fields,
  formData,
  setFormData,
  errors,
  submissionId,
  onRemove,
}: FormSectionProps) => {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [fieldPositions, setFieldPositions] = useState<Record<string, any>>({});
  const { toast } = useToast();
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active) return;

    const fieldId = active.id as string;
    const currentPosition = fieldPositions[fieldId] || {};
    const newX = (currentPosition.x_position || 0) + delta.x;
    const newY = (currentPosition.y_position || 0) + delta.y;

    const newPositions = {
      ...fieldPositions,
      [fieldId]: {
        ...currentPosition,
        x_position: newX,
        y_position: newY,
      },
    };

    setFieldPositions(newPositions);

    try {
      const { error } = await supabase
        .from("form_field_positions")
        .upsert({
          field_id: fieldId,
          section,
          x_position: newX,
          y_position: newY,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving field position:", error);
      toast({
        title: "Error",
        description: "Failed to save field position",
        variant: "destructive",
      });
    }
  };

  const handleFieldUpdate = async (updates: {
    width?: string;
    height?: string;
    alignment?: string;
  }) => {
    if (!selectedField) return;

    const newPositions = {
      ...fieldPositions,
      [selectedField]: {
        ...fieldPositions[selectedField],
        ...updates,
      },
    };

    setFieldPositions(newPositions);

    try {
      const { error } = await supabase
        .from("form_field_positions")
        .upsert({
          field_id: selectedField,
          section,
          ...updates,
          user_id: (await supabase.auth.getUser()).data.user?.id,
        });

      if (error) throw error;
    } catch (error) {
      console.error("Error saving field properties:", error);
      toast({
        title: "Error",
        description: "Failed to save field properties",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
      <SectionHeader section={section} onRemove={onRemove} />
      
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="relative min-h-[200px]" onClick={() => setSelectedField(null)}>
          {fields.map((field) => {
            const position = fieldPositions[field.id] || {};
            return (
              <DraggableField
                key={field.id}
                id={field.id}
                fieldType={field.type}
                label={field.label}
                value={formData[field.id]}
                onChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, [field.id]: value }))
                }
                width={position.width}
                height={position.height}
                alignment={position.alignment}
                onSelect={() => setSelectedField(field.id)}
                isSelected={selectedField === field.id}
              />
            );
          })}
        </div>
      </DndContext>

      <FormFieldProperties
        open={!!selectedField}
        onClose={() => setSelectedField(null)}
        selectedField={
          selectedField
            ? {
                id: selectedField,
                ...fieldPositions[selectedField],
              }
            : null
        }
        onUpdate={handleFieldUpdate}
      />
    </div>
  );
};

export default FormSection;