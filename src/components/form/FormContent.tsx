import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import FormSection from "./FormSection";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import SpouseToggle from "./SpouseToggle";
import { FormSubmission } from "@/types/form";
import DragContext from "./DragContext";
import FormPositionLoader from "./FormPositionLoader";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission = null, onUpdate }: FormContentProps) => {
  const [sections, setSections] = React.useState(INITIAL_FIELDS);
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
    <form onSubmit={(e) => e.preventDefault()} className="max-w-[95%] mx-auto p-4">
      <FormPositionLoader sections={sections} setSections={setSections} />
      <div className="flex justify-end mb-4">
        <SpouseToggle />
      </div>
      <DragContext sections={sections} setSections={setSections}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </DragContext>
      
      <FormButtons onSubmit={handleOutcomeSubmit} />
    </form>
  );
};

export default FormContent;