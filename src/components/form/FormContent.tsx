import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import { FormSubmission } from "@/types/form";
import FormSection from "@/components/FormSection";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission, onUpdate }: FormContentProps) => {
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { showSpouse } = useSpouseVisibility();
  const { familyMembers } = useFamilyMembers();

  const filteredSections = INITIAL_FIELDS.filter(section => {
    const isSpouseSection = section.section.toLowerCase().includes('spouse');
    return showSpouse ? true : !isSpouseSection;
  });

  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => {
    e.preventDefault();
    handleSubmit(e, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full">
      <div className="space-y-4">
        {filteredSections.map((section, index) => (
          <FormSection
            key={`${section.section}-${index}`}
            section={section.section}
            fields={section.fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        ))}
        
        {familyMembers.map((member, index) => (
          <FormSection
            key={member.id}
            section={`Family Member ${index + 1}`}
            fields={INITIAL_FIELDS[0].fields.filter(field => !field.id.toLowerCase().includes('spouse'))}
            formData={member.data}
            setFormData={(data) => {
              const updatedMembers = [...familyMembers];
              updatedMembers[index] = { ...member, data };
            }}
            errors={{}}
            submissionId={member.id}
          />
        ))}
      </div>
      
      <FormButtons onSubmit={handleFormSubmit} />
    </form>
  );
};

export default FormContent;