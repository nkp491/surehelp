import { FormField } from "@/types/formTypes";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import PrimaryHealth from "./PrimaryHealth";
import { isAgentField } from "@/utils/fieldCategories";
import SectionHeader from "./sections/SectionHeader";
import RegularFieldsSection from "./sections/RegularFieldsSection";
import AgentSection from "./sections/AgentSection";

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

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-2">
      <SectionHeader section={section} onRemove={onRemove} />
      <div className="p-2">
        {section === "Assessment Notes" ? (
          <div className="space-y-2">
            <RegularFieldsSection
              fields={nonAgentFields}
              formData={formData}
              setFormData={setFormData}
              errors={errors}
              submissionId={submissionId}
            />
            
            {agentFields.length > 0 && (
              <AgentSection
                fields={agentFields}
                formData={formData}
                setFormData={setFormData}
                errors={errors}
                submissionId={submissionId}
              />
            )}
          </div>
        ) : (
          <RegularFieldsSection
            fields={regularFields}
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            submissionId={submissionId}
          />
        )}
      </div>
    </div>
  );
};

export default FormSection;