import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import { FormSubmission } from "@/types/form";
import { useFieldPositions } from "@/components/form-builder/useFieldPositions";
import DragDropArea from "../form-builder/DragDropArea";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission, onUpdate }: FormContentProps) => {
  const [sections] = React.useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { selectedField, setSelectedField } = useFormBuilder();
  const { showSpouse } = useSpouseVisibility();

  // Filter out spouse-related fields when showSpouse is false
  const filteredFields = sections.reduce((acc, section) => {
    const sectionFields = section.fields.filter(field => {
      const isSpouseField = field.id.toLowerCase().includes('spouse');
      return showSpouse ? true : !isSpouseField;
    });
    return [...acc, ...sectionFields];
  }, []);

  const { fieldPositions, handleDragEnd } = useFieldPositions({
    section: "Combined Form",
    fields: filteredFields,
    selectedField
  });

  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => {
    e.preventDefault();
    handleSubmit(e, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full">
      <DragDropArea
        fields={filteredFields}
        fieldPositions={fieldPositions}
        formData={formData}
        setFormData={setFormData}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
      />
      
      <FormButtons onSubmit={handleFormSubmit} />
    </form>
  );
};

export default FormContent;