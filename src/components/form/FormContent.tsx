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

  // Filter out spouse sections and separate special sections
  const mainSections = sections.filter(section => {
    return !section.section.includes("Spouse") && 
           !section.section.includes("Agent Use Only") && 
           !section.section.includes("Assessment Notes");
  });

  const agentOnlySection = sections.find(section => 
    section.section.includes("Agent Use Only")
  );

  const assessmentNotesSection = sections.find(section => 
    section.section.includes("Assessment Notes")
  );

  return (
    <form onSubmit={(e) => e.preventDefault()} className="container mx-auto px-4">
      <div className="flex justify-end mb-2">
        <FamilyMemberToggle />
      </div>

      {/* Main sections container */}
      <div className="space-y-6">
        {/* Primary applicant sections */}
        {mainSections.map((section) => (
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
            {mainSections
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

        {/* Agent Only section */}
        {agentOnlySection && (
          <FormSection
            key={agentOnlySection.section}
            section={agentOnlySection.section}
            fields={agentOnlySection.fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            submissionId={editingSubmission?.timestamp}
          />
        )}

        {/* Assessment Notes section */}
        {assessmentNotesSection && (
          <FormSection
            key={assessmentNotesSection.section}
            section={assessmentNotesSection.section}
            fields={assessmentNotesSection.fields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            submissionId={editingSubmission?.timestamp}
          />
        )}
      </div>
      
      <FormButtons onSubmit={handleOutcomeSubmit} />
    </form>
  );
};

export default FormContent;