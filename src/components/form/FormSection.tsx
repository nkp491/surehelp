import { FormField } from "@/types/formTypes";
import SectionHeader from "./SectionHeader";
import HealthMetricsRow from "./HealthMetricsRow";
import TwoColumnLayout from "./TwoColumnLayout";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";

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
  
  // Function to check if a field should be rendered in the special row
  const isSpecialField = (fieldId: string) => {
    return ['height', 'weight', 'tobaccoUse'].includes(fieldId);
  };

  // Function to check if a field is spouse-related
  const isSpouseField = (fieldId: string) => {
    return fieldId.toLowerCase().startsWith('spouse');
  };

  // Filter out spouse fields if spouse toggle is off
  const filteredFields = fields.filter(field => {
    if (isSpouseField(field.id)) {
      return showSpouse;
    }
    return true;
  });

  // Separate special fields from regular fields
  const regularFields = filteredFields.filter(field => !isSpecialField(field.id));

  // Hide entire spouse sections if spouse toggle is off
  if (!showSpouse && section.toLowerCase().includes('spouse')) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 space-y-1">
      <SectionHeader section={section} onRemove={onRemove} />
      
      {section === "Primary Health Assessment" && (
        <HealthMetricsRow
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          submissionId={submissionId}
        />
      )}

      <TwoColumnLayout
        fields={regularFields}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        submissionId={submissionId}
      />
    </div>
  );
};

export default FormSection;