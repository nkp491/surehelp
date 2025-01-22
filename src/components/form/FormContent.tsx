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
  const { familyMembers, removeFamilyMember } = useFamilyMembers();

  const handleOutcomeSubmit = (outcome: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    handleSubmit(e as any, outcome);
  };

  const filteredSections = sections.filter(section => {
    // Remove spouse-related sections
    return !section.section.includes("Spouse");
  });

  // Separate assessment notes section from other sections
  const assessmentNotesSection = filteredSections.find(section => 
    section.section === "Assessment Notes"
  );
  const otherSections = filteredSections.filter(section => 
    section.section !== "Assessment Notes"
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="container mx-auto px-4">
      <div className="flex justify-end mb-2">
        <FamilyMemberToggle />
      </div>

      {/* Main grid for all sections except Assessment Notes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6">
        {/* Primary applicant sections */}
        {otherSections.map((section) => (
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
            {otherSections
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

      {/* Assessment Notes section - full width */}
      {assessmentNotesSection && (
        <div className="w-full mb-6">
          <FormSection
            section={assessmentNotesSection.section}
            fields={assessmentNotesSection.fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            submissionId={editingSubmission?.timestamp}
          />
        </div>
      )}
      
      <FormButtons onSubmit={handleOutcomeSubmit} />
    </form>
  );
};

export default FormContent;