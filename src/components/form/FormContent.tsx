import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import { FormSubmission } from "@/types/form";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import DragDropArea from "../form-builder/DragDropArea";
import { useFieldPositions } from "../form-builder/useFieldPositions";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission = null, onUpdate }: FormContentProps) => {
  const [sections] = React.useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { familyMembers, removeFamilyMember } = useFamilyMembers();
  const { isEditMode, selectedField, setSelectedField } = useFormBuilder();
  
  // Get field positions and handlers for each section
  const sectionPositions = sections.map(section => {
    const { fieldPositions, handleDragEnd } = useFieldPositions({
      section: section.section,
      fields: section.fields,
      selectedField
    });
    return { section, fieldPositions, handleDragEnd };
  });

  const handleFormSubmit = (e: React.MouseEvent, outcome: string) => {
    e.preventDefault();
    handleSubmit(e, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="container mx-auto px-4">
      <div className="space-y-6">
        {sectionPositions.map(({ section, fieldPositions, handleDragEnd }) => (
          <DragDropArea
            key={section.section}
            fields={section.fields}
            fieldPositions={fieldPositions}
            formData={formData}
            setFormData={setFormData}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />
        ))}
      </div>
      
      <FormButtons onSubmit={handleFormSubmit} />
    </form>
  );
};

export default FormContent;