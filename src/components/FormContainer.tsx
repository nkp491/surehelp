import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import DraggableFormField from "./DraggableFormField";
import { FormSubmission } from "@/types/form";
import { INITIAL_FIELDS } from "./form/FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import { FormField } from "@/types/formTypes";

interface FormContainerProps {
  editingSubmission: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission, onUpdate }: FormContainerProps) => {
  const [fields, setFields] = useState<FormField[]>(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      setFields((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleOutcomeSubmit = (outcome: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(e as any, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="space-y-6 max-w-xl mx-auto p-6">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {fields.map((field) => (
              <DraggableFormField
                key={field.id}
                id={field.id}
                fieldType={field.type}
                label={field.label}
                value={formData[field.id as keyof FormSubmission]}
                onChange={(value) =>
                  setFormData((prev) => ({ ...prev, [field.id]: value }))
                }
                placeholder={field.placeholder}
                required={field.required}
                error={errors[field.id as keyof FormSubmission]}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <div className="grid grid-cols-3 gap-4">
        <Button 
          onClick={handleOutcomeSubmit('protected')}
          className="bg-green-600 hover:bg-green-700"
        >
          Protected
        </Button>
        <Button 
          onClick={handleOutcomeSubmit('follow-up')}
          className="bg-yellow-600 hover:bg-yellow-700"
        >
          Follow-Up
        </Button>
        <Button 
          onClick={handleOutcomeSubmit('declined')}
          className="bg-red-600 hover:bg-red-700"
        >
          Declined
        </Button>
      </div>
    </form>
  );
};

export default FormContainer;