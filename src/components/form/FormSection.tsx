import { FormField } from "@/types/formTypes";
import { FormSubmission } from "@/types/form";
import DraggableFormField from "../DraggableFormField";

interface FormSectionProps {
  section: string;
  fields: FormField[];
  formData: FormSubmission;
  setFormData: (value: React.SetStateAction<FormSubmission>) => void;
  errors: Partial<FormSubmission>;
}

const FormSection = ({ section, fields, formData, setFormData, errors }: FormSectionProps) => {
  const handleFieldChange = (fieldId: string, value: string | string[]) => {
    setFormData((prev: FormSubmission) => {
      // Handle array fields specifically
      if (
        fieldId === "selectedConditions" ||
        fieldId === "employmentStatus" ||
        fieldId === "selectedInvestments"
      ) {
        return {
          ...prev,
          [fieldId]: value as string[]
        };
      }
      // Handle all other fields as strings
      return {
        ...prev,
        [fieldId]: value as string
      };
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">{section}</h2>
      <div className="space-y-4">
        {fields.map((field) => (
          <DraggableFormField
            key={field.id}
            id={field.id}
            fieldType={field.type}
            label={field.label}
            value={formData[field.id as keyof FormSubmission]}
            onChange={(value) => handleFieldChange(field.id, value)}
            placeholder={field.placeholder}
            required={field.required}
            error={errors[field.id as keyof FormSubmission]}
          />
        ))}
      </div>
    </div>
  );
};

export default FormSection;