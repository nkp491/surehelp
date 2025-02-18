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
  const { familyMembers, updateFamilyMember, removeFamilyMember } = useFamilyMembers();

  const filteredSections = sections.filter(section => {
    const isSpouseSection = section.section.toLowerCase().includes('spouse');
    return showSpouse ? true : !isSpouseSection;
  });

  const handleFormSubmit = (e: React.MouseEvent<HTMLButtonElement>, outcome: string) => {
    e.preventDefault();
    handleSubmit(e, outcome);
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="min-h-[calc(100vh-120px)]">
      <div className="form-layout">
        {/* Primary Health Assessment Column */}
        <div className="space-y-6">
          <FormSection
            key="Primary Health Assessment"
            section="Primary Health Assessment"
            fields={sections[0].fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        </div>

        {/* Income Assessment Column */}
        <div className="space-y-6">
          <FormSection
            key="Primary Income Assessment"
            section="Primary Income Assessment"
            fields={sections[2].fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
          <FormSection
            key="Household Income"
            section="Household Income"
            fields={sections[4].fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        </div>

        {/* Assessment Notes and Agent Use Only Column */}
        <div className="space-y-6">
          <FormSection
            key="Assessment Notes"
            section="Assessment Notes"
            fields={sections[5].fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
          <FormSection
            key="Agent Use Only"
            section="Agent Use Only"
            fields={sections[6].fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
          />
        </div>
      </div>
      
      {familyMembers.map((member, index) => (
        <FormSection
          key={member.id}
          section={`Family Member ${index + 1}`}
          fields={sections[0].fields.filter(field => !field.id.toLowerCase().includes('spouse'))}
          formData={member.data}
          setFormData={(data) => updateFamilyMember(member.id, data)}
          errors={{}}
          submissionId={member.id}
          onRemove={() => removeFamilyMember(member.id)}
        />
      ))}
      
      <FormButtons onSubmit={handleFormSubmit} />
    </form>
  );
};

export default FormContent;