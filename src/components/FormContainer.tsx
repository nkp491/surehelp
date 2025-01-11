import React, { useState, useEffect } from "react";
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
import { FormSubmission } from "@/types/form";
import { INITIAL_FIELDS } from "./form/FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./form/FormButtons";
import FormSection from "./form/FormSection";
import { SpouseVisibilityProvider, useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import SpouseToggle from "./form/SpouseToggle";

const FormContent = ({ 
  editingSubmission = null, 
  onUpdate 
}: { 
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}) => {
  const [sections, setSections] = useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { showSpouse, setShowSpouse } = useSpouseVisibility();

  useEffect(() => {
    if (editingSubmission) {
      // Set form data from editing submission
      const { timestamp, outcome, auditTrail, ...submissionData } = editingSubmission;
      setFormData(submissionData);
      
      // Show spouse section if spouse data exists
      if (editingSubmission.spouseName || editingSubmission.spouseDob) {
        setShowSpouse(true);
      }
    }
  }, [editingSubmission, setFormData, setShowSpouse]);

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

  const filteredSections = sections.filter(section => {
    if (!showSpouse && (section.section.includes("Spouse"))) {
      return false;
    }
    return true;
  });

  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-7xl mx-auto p-6">
      <div className="flex justify-end mb-4">
        <SpouseToggle />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={filteredSections.flatMap(section => section.fields).map(field => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSections.map((section) => (
              <FormSection
                key={section.section}
                section={section.section}
                fields={section.fields}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      
      <FormButtons onSubmit={handleOutcomeSubmit} />
    </form>
  );
};

const FormContainer = (props: { 
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}) => {
  return (
    <SpouseVisibilityProvider>
      <FormContent {...props} />
    </SpouseVisibilityProvider>
  );
};

export default FormContainer;