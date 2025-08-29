import { INITIAL_FIELDS } from "./FormFields";
import { useFormLogic } from "@/hooks/useFormLogic";
import FormButtons from "./FormButtons";
import { FormSubmission } from "@/types/form";
import { useFamilyMembers } from "@/contexts/FamilyMembersContext";
import FormSection from "@/components/FormSection";
import DirectTotalIncomeCalculator from "@/components/form-fields/DirectTotalIncomeCalculator";
import { useState } from "react";

interface FormContentProps {
  editingSubmission?: FormSubmission | null;
  onUpdate?: (submission: FormSubmission) => void;
}

const FormContent = ({ editingSubmission, onUpdate }: FormContentProps) => {
  const [sections] = useState(INITIAL_FIELDS);
  const { formData, setFormData, errors, handleSubmit, initialFormValues } =
    useFormLogic(editingSubmission, onUpdate);
  const { familyMembers, updateFamilyMember, removeFamilyMember } =
    useFamilyMembers();
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState<string | undefined>(
    undefined
  );

  const handleFormSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>,
    outcome: string
  ) => {
    e.preventDefault();
    setLoading(true);
    setLoadingButton(outcome);

    try {
      const success = await handleSubmit(e, outcome);
      if (success) {
        // Delay form reset to prevent visual break
        setTimeout(() => {
          setFormData(initialFormValues);
        }, 100);
      }
    } finally {
      setLoading(false);
      setLoadingButton(undefined);
    }
  };

  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="min-h-[calc(100vh-180px)] pb-8"
    >
      <DirectTotalIncomeCalculator
        formData={formData}
        setFormData={setFormData}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-4 max-w-[1440px] mx-auto">
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
          fields={sections[0].fields.filter(
            (field) => !field.id.toLowerCase().includes("spouse")
          )}
          formData={member.data}
          setFormData={(data) => updateFamilyMember(member.id, data)}
          errors={{}}
          submissionId={member.id}
          onRemove={() => removeFamilyMember(member.id)}
        />
      ))}
      <FormButtons
        onSubmit={handleFormSubmit}
        loading={loading}
        loadingButton={loadingButton}
      />
    </form>
  );
};

export default FormContent;
