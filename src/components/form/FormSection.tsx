import { FormField } from "@/types/form";
import DraggableFormField from "../DraggableFormField";

interface FormSectionProps {
  section: string;
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
}

const FormSection = ({ section, fields, formData, setFormData, errors }: FormSectionProps) => {
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
            value={formData[field.id]}
            onChange={(value) =>
              setFormData((prev: any) => ({ ...prev, [field.id]: value }))
            }
            placeholder={field.placeholder}
            required={field.required}
            error={errors[field.id]}
          />
        ))}
      </div>
    </div>
  );
};

export default FormSection;