import { FormField } from "@/types/formTypes";
import SectionHeader from "./form/SectionHeader";
import HealthMetricsRow from "./form/HealthMetricsRow";
import TwoColumnLayout from "./form/TwoColumnLayout";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import DraggableFormField from "./DraggableFormField";

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

  const isAgentField = (fieldId: string) => {
    return ['sourcedFrom', 'leadType', 'premium', 'effectiveDate', 'draftDay', 'accidental'].includes(fieldId);
  };

  const filteredFields = fields.filter(field => {
    if (isSpouseField(field.id)) {
      return showSpouse;
    }
    return true;
  });

  const regularFields = filteredFields.filter(field => !isSpecialField(field.id));

  if (!showSpouse && section.toLowerCase().includes('spouse')) {
    return null;
  }

  const renderField = (field: FormField) => {
    return (
      <DraggableFormField
        key={field.id}
        id={field.id}
        fieldType={field.type}
        label={field.label}
        value={formData[field.id]}
        onChange={(value) => setFormData((prev: any) => ({ ...prev, [field.id]: value }))}
        placeholder={field.placeholder}
        required={field.required}
        error={errors[field.id]}
        submissionId={submissionId}
      />
    );
  };

  return (
    <div className="bg-white mb-2">
      <div className="bg-[#00A3E0] text-white px-3 py-1 text-base font-medium">
        {section}
      </div>
      <div className="p-2 space-y-2">
        {section === "Primary Health Assessment" && (
          <HealthMetricsRow
            formData={formData}
            setFormData={setFormData}
            errors={errors}
            submissionId={submissionId}
          />
        )}

        {section === "Assessment Notes" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {regularFields.map(field => renderField(field))}
          </div>
        ) : (
          <TwoColumnLayout
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