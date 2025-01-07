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
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContainer = ({ editingSubmission = null, onUpdate }: FormContainerProps) => {
  const [sections, setSections] = useState(INITIAL_FIELDS);
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
      const allFields = sections.flatMap(section => section.fields);
      const newFields = arrayMove(
        allFields,
        allFields.findIndex(item => item.id === active.id),
        allFields.findIndex(item => item.id === over.id)
      );
      
      // Reconstruct sections with new field order
      const newSections = sections.map(section => ({
        ...section,
        fields: newFields.filter(field => 
          section.fields.some(originalField => originalField.id === field.id)
        )
      }));
      
      setSections(newSections);
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
          items={sections.flatMap(section => section.fields).map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-8">
            {sections.map((section, index) => (
              <div key={section.section} className="bg-white rounded-lg shadow-sm p-6 space-y-4">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">{section.section}</h2>
                <div className="space-y-4">
                  {section.fields.map((field) => (
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
              </div>
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