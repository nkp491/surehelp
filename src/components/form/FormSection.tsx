import { FormField } from "@/types/formTypes";
import DraggableFormField from "../DraggableFormField";

interface FormSectionProps {
  section: string;
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
}

const FormSection = ({ 
  section, 
  fields, 
  formData, 
  setFormData, 
  errors,
  submissionId 
}: FormSectionProps) => {
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 space-y-2">
      <div className="flex justify-between items-center mb-1">
        <h2 className="text-lg font-semibold text-gray-900">{section}</h2>
      </div>
      <div className="space-y-2">
        {fields.map((field) => (
          <DraggableFormField
            key={field.id}
            id={field.id}
            fieldType={field.type}
            label={field.label}
            value={formData[field.id]}
            onChange={(value) =>
              setFormData((prev: any) => ({ ...prev, [field.id]: value }))
            }
            placeholder={field.placeholder}
            required={field.required}
            error={errors[field.id]}
            submissionId={submissionId}
          />
        ))}
      </div>
    </div>
  );
};

export default FormSection;