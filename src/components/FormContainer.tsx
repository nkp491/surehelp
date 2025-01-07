import React, { useState, useEffect } from "react";
import { FormSubmission } from "@/types/form";
import { INITIAL_FIELDS } from "./form/FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormSection from "./form/FormSection";
import FormOutcomeButtons from "./form/FormOutcomeButtons";
import DragDropFormContext from "./form/DragDropFormContext";

const FormContainer = ({ 
  editingSubmission = null, 
  onUpdate 
}: { 
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}) => {
  const [sections, setSections] = useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);

  useEffect(() => {
    if (editingSubmission) {
      setFormData(editingSubmission);
    }
  }, [editingSubmission, setFormData]);

  const handleOutcomeSubmit = (outcome: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(e as any, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="max-w-7xl mx-auto p-6">
      <DragDropFormContext sections={sections} setSections={setSections}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sections.map((section) => (
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
      </DragDropFormContext>
      
      <FormOutcomeButtons onOutcomeSubmit={handleOutcomeSubmit} />
    </form>
  );
};

export default FormContainer;