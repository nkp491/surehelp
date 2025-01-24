import { DndContext, DragEndEvent, useSensor, useSensors, PointerSensor } from "@dnd-kit/core";
import { useState } from "react";
import DraggableField from "../form-builder/DraggableField";
import FormFieldProperties from "../form-builder/FormFieldProperties";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FormField } from "@/types/formTypes";
import SectionHeader from "./SectionHeader";
import { snapToGrid } from "@/utils/gridUtils";

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
        distance: 8, // Match grid size
      },
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, delta } = event;
    if (!active) return;

    const fieldId = active.id as string;
    const currentPosition = fieldPositions[fieldId] || {};
    
    // Snap the new position to grid
    const newX = snapToGrid(Math.round((currentPosition.x_position || 0) + delta.x));
    const newY = snapToGrid(Math.round((currentPosition.y_position || 0) + delta.y));

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("No authenticated user found");
      }

      // First try to get existing position
      const { data: existingPosition } = await supabase
        .from('form_field_positions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('field_id', fieldId)
        .eq('section', section)
        .maybeSingle();

      if (existingPosition) {
        const { error: updateError } = await supabase
          .from('form_field_positions')
          .update({
            x_position: newX,
            y_position: newY,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPosition.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('form_field_positions')
          .insert({
            user_id: user.data.user.id,
            field_id: fieldId,
            section,
            x_position: newX,
            y_position: newY,
            position: fields.findIndex(f => f.id === fieldId),
          });

        if (insertError) throw insertError;
      }

      // Update local state
      setFieldPositions(prev => ({
        ...prev,
        [fieldId]: {
          ...prev[fieldId],
          x_position: newX,
          y_position: newY,
        },
      }));

      toast({
        title: "Success",
        description: "Field position updated",
      });

    } catch (error: any) {
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

    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error("No authenticated user found");
      }

      // First try to get existing position
      const { data: existingPosition } = await supabase
        .from('form_field_positions')
        .select('*')
        .eq('user_id', user.data.user.id)
        .eq('field_id', selectedField)
        .eq('section', section)
        .maybeSingle();

      if (existingPosition) {
        // Update existing position
        const { error: updateError } = await supabase
          .from('form_field_positions')
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existingPosition.id);

        if (updateError) throw updateError;
      } else {
        // Insert new position
        const { error: insertError } = await supabase
          .from('form_field_positions')
          .insert({
            user_id: user.data.user.id,
            field_id: selectedField,
            section,
            position: fields.findIndex(f => f.id === selectedField),
            ...updates,
          });

        if (insertError) throw insertError;
      }

      // Update local state
      setFieldPositions(prev => ({
        ...prev,
        [selectedField]: {
          ...prev[selectedField],
          ...updates,
        },
      }));

    } catch (error: any) {
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
        <div className="relative min-h-[200px] bg-grid" onClick={() => setSelectedField(null)}>
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
                style={{
                  transform: `translate3d(${position.x_position || 0}px, ${position.y_position || 0}px, 0)`,
                }}
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