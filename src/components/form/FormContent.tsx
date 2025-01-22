import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import FormSection from "./FormSection";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import SpouseToggle from "./SpouseToggle";
import { FormSubmission } from "@/types/form";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission = null, onUpdate }: FormContentProps) => {
  const [sections] = React.useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { showSpouse } = useSpouseVisibility();

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
    <form onSubmit={(e) => e.preventDefault()} className="max-w-[99%] mx-auto">
      <div className="flex justify-end mb-2">
        <SpouseToggle />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredSections.map((section) => (
          <FormSection
            key={section.section}
            section={section.section}
            fields={section.fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            submissionId={editingSubmission?.timestamp}
          />
        ))}
      </div>
      
      <FormButtons onSubmit={handleOutcomeSubmit} />
    </form>
  );
};

export default FormContent;