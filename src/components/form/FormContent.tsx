import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import { FormSubmission } from "@/types/form";
import { useFieldPositions } from "@/components/form-builder/useFieldPositions";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import FormSection from "@/components/FormSection";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission, onUpdate }: FormContentProps) => {
  const [sections] = React.useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { selectedField, setSelectedField } = useFormBuilder();
  const { showSpouse } = useSpouseVisibility();
  const { familyMembers } = useFamilyMembers();

  const filteredSections = sections.filter(section => {
    const isSpouseSection = section.section.toLowerCase().includes('spouse');
    return showSpouse ? true : !isSpouseSection;
  });

  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => {
    e.preventDefault();
    handleSubmit(e, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="w-full space-y-2">
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
      
      {familyMembers.map((member, index) => (
        <FormSection
          key={member.id}
          section={`Family Member ${index + 1}`}
          fields={sections[0].fields.filter(field => !field.id.toLowerCase().includes('spouse'))}
          formData={member.data}
          setFormData={(data) => {
            const updatedMembers = [...familyMembers];
            updatedMembers[index] = { ...member, data };
          }}
          errors={{}}
          submissionId={member.id}
          onRemove={() => {
            const updatedMembers = familyMembers.filter((_, i) => i !== index);
            // Update family members context here
          }}
        />
      ))}
      
      <FormButtons onSubmit={handleFormSubmit} />
    </form>
  );
};

export default FormContent;