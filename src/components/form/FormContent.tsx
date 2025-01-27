import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import { FormSubmission } from "@/types/form";
import { useFieldPositions } from "@/components/form-builder/useFieldPositions";
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

  const allFields = sections.reduce((acc, section) => {
    return [...acc, ...section.fields];
  }, []);

  const { fieldPositions, handleDragEnd } = useFieldPositions({
    section: "Combined Form",
    fields: allFields,
    selectedField
  });

  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => {
    e.preventDefault();
    handleSubmit(e, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full">
      <DragDropArea
        fields={allFields}
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