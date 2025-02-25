
import { FormField } from "@/types/formTypes";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import PrimaryHealth from "./form/PrimaryHealth";
import { isAgentField } from "@/utils/fieldCategories";
import SectionHeader from "./form/sections/SectionHeader";
import RegularFieldsSection from "./form/sections/RegularFieldsSection";
import AgentSection from "./form/sections/AgentSection";

interface FormSectionProps {
  section: string;
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
  onRemove?: () => void;
}

const FormSection = ({ 
  section, 
  fields, 
  formData, 
  setFormData, 
  errors,
  submissionId,
  onRemove
}: FormSectionProps) => {
  const { showSpouse } = useSpouseVisibility();
  
  const isSpecialField = (fieldId: string) => {
    return ['height', 'weight', 'tobaccoUse'].includes(fieldId);
  };

  const isSpouseField = (fieldId: string) => {
    return fieldId.toLowerCase().startsWith('spouse');
  };

  const filteredFields = fields.filter(field => {
    if (isSpouseField(field.id)) {
      return showSpouse;
    }
    return true;
  });

  const regularFields = filteredFields.filter(field => !isSpecialField(field.id));
  const nonAgentFields = regularFields.filter(field => !isAgentField(field.id));
  const agentFields = regularFields.filter(field => isAgentField(field.id));

  if (!showSpouse && section.toLowerCase().includes('spouse')) {
    return null;
  }

  if (section === "Primary Health Assessment") {
    return <PrimaryHealth formData={formData} setFormData={setFormData} errors={errors} />;
  }

  const isIncomeSection = section === "Primary Income Assessment";
  const isHouseholdSection = section === "Household Income";
  const isAgentSection = section === "Agent Use Only";
  const isAssessmentNotesSection = section === "Assessment Notes";

  const shouldBeHorizontal = (fieldId: string) => {
    return ['premium', 'coverageAmount'].includes(fieldId);
  };

  return (
    <div className="form-section">
      <div className="form-section-header">
        <SectionHeader section={section} onRemove={onRemove} />
      </div>
      <div className={`form-section-content ${isIncomeSection ? 'space-y-4' : isAssessmentNotesSection ? 'space-y-6' : 'space-y-3'}`}>
        {isHouseholdSection ? (
          <div className="form-group-horizontal">
            {nonAgentFields.map((field) => (
              <div key={field.id} className={field.id === "expenses" ? "col-span-2" : ""}>
                <RegularFieldsSection
                  fields={[field]}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  submissionId={submissionId}
                />
              </div>
            ))}
          </div>
        ) : isIncomeSection ? (
          <div className="grid grid-cols-1 gap-5">
            {nonAgentFields.map((field) => (
              <div key={field.id}>
                <RegularFieldsSection
                  fields={[field]}
                  formData={formData}
                  setFormData={setFormData}
                  errors={errors}
                  submissionId={submissionId}
                />
              </div>
            ))}
          </div>
        ) : isAgentSection ? (
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-2 gap-4">
              {agentFields
                .filter(field => !shouldBeHorizontal(field.id))
                .map((field) => (
                  <div key={field.id} className={
                    field.id === "carrierAndProduct" ? "col-span-2" : ""
                  }>
                    <RegularFieldsSection
                      fields={[field]}
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      submissionId={submissionId}
                    />
                  </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {agentFields
                .filter(field => shouldBeHorizontal(field.id))
                .map((field) => (
                  <div key={field.id}>
                    <RegularFieldsSection
                      fields={[field]}
                      formData={formData}
                      setFormData={setFormData}
                      errors={errors}
                      submissionId={submissionId}
                    />
                  </div>
                ))}
            </div>
          </div>
        ) : (
          <div className="form-group">
            <RegularFieldsSection
              fields={nonAgentFields}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              submissionId={submissionId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FormSection;
