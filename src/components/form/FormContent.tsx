import React from "react";
import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import FormSection from "./FormSection";
import FamilyMemberToggle from "./FamilyMemberToggle";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import { FormSubmission } from "@/types/form";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission = null, onUpdate }: FormContentProps) => {
  const [sections] = React.useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit } = useFormLogic(editingSubmission, onUpdate);
  const { familyMembers } = useFamilyMembers();

  const handleOutcomeSubmit = (outcome: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(e as any, outcome);
  };

  const filteredSections = sections.filter(section => {
    // Remove spouse-related sections
    return !section.section.includes("Spouse");
  });

  return (
    <form onSubmit={(e) => e.preventDefault()} className="container mx-auto px-4">
      <div className="flex justify-end mb-2">
        <FamilyMemberToggle />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Primary applicant sections */}
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
        
        {/* Family member sections */}
        {familyMembers.map((member, index) => (
          <React.Fragment key={member.id}>
            {filteredSections
              .filter(section => 
                section.section.includes("Health Assessment") || 
                section.section.includes("Income Assessment")
              )
              .map((section) => (
                <FormSection
                  key={`${member.id}-${section.section}`}
                  section={`Family Member ${index + 1} ${section.section}`}
                  fields={section.fields}
                  formData={member.data}
                  setFormData={(data) => {
                    const { familyMembers: _, ...rest } = data;
                    member.data = rest;
                  }}
                  errors={errors}
                  submissionId={editingSubmission?.timestamp}
                  onRemove={() => removeFamilyMember(member.id)}
                />
              ))}
          </React.Fragment>
        ))}
      </div>
      
      <FormButtons onSubmit={handleOutcomeSubmit} />
    </form>
  );
};

export default FormContent;