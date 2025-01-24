import { FormField } from "@/types/formTypes";
import SectionHeader from "./form/SectionHeader";
import HealthMetricsRow from "./form/HealthMetricsRow";
import TwoColumnLayout from "./form/TwoColumnLayout";

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
  // Function to check if a field should be rendered in the special row
  const isSpecialField = (fieldId: string) => {
    return ['height', 'weight', 'tobaccoUse'].includes(fieldId);
  };

  // Function to check if a field belongs to primary health assessment
  const isPrimaryHealthField = (fieldId: string) => {
    return [
      'name', 'dob', 'age', 'height', 'weight', 'tobaccoUse',
      'dui', 'selectedConditions', 'medicalConditions', 'hospitalizations',
      'surgeries', 'prescriptionMedications', 'lastMedicalExam',
      'familyMedicalConditions'
    ].includes(fieldId);
  };

  // Separate special fields from regular fields
  const regularFields = fields.filter(field => !isSpecialField(field.id));
  
  // For Primary Health Assessment, group all related fields together
  const primaryHealthFields = section === "Primary Health Assessment" 
    ? regularFields.filter(field => isPrimaryHealthField(field.id))
    : regularFields;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-2 space-y-2">
      <SectionHeader section={section} onRemove={onRemove} />
      
      {/* Special row for height, weight, and tobacco use if this is the Primary Health Assessment section */}
      {section === "Primary Health Assessment" && (
        <HealthMetricsRow
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          submissionId={submissionId}
        />
      )}

      {/* Regular two-column layout for remaining fields */}
      <TwoColumnLayout
        fields={primaryHealthFields}
        formData={formData}
        setFormData={setFormData}
        errors={errors}
        submissionId={submissionId}
      />
    </div>
  );
};

export default FormSection;