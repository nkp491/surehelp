import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import { FormSubmission } from "@/types/form";
import { useFieldPositions } from "@/hooks/form-builder/useFieldPositions";
import DragDropArea from "../form-builder/DragDropArea";
import { useFormBuilder } from "@/contexts/FormBuilderContext";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission, onUpdate }: FormContentProps) => {
  const [sections] = React.useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { selectedField, setSelectedField } = useFormBuilder();

  // Get field positions and handlers for each section
  const sectionPositions = sections.map(section => {
    const { fieldPositions, handleDragEnd } = useFieldPositions({
      section: section.section,
      fields: section.fields,
      selectedField
    });
    return { section, fieldPositions, handleDragEnd };
  });

  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => {
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