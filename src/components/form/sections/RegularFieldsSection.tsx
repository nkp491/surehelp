import { FormField } from "@/types/formTypes";
import DraggableFormField from "../../DraggableFormField";

interface RegularFieldsSectionProps {
  fields: FormField[];
  formData: Record<string, string>;
  setFormData: (data: Record<string, string>) => void;
  errors: Record<string, string>;
  submissionId?: string;
}

const RegularFieldsSection = ({
  fields,
  formData,
  setFormData,
  errors,
  submissionId,
}: RegularFieldsSectionProps) => {
  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData({
      ...formData,
      [fieldId]: value,
    });
  };

  return (
    <div className="space-y-4 min-h-[200px]">
      {fields.map((field) => (
        <div key={field.id} className="transition-all duration-200">
          <DraggableFormField
            id={field.id}
            fieldType={field.type}
            label={field.label}
            value={formData[field.id] || ""}
            onChange={(value) => handleFieldChange(field.id, value as string)}
            placeholder={field.placeholder}
            required={field.required}
            error={errors[field.id]}
            submissionId={submissionId}
          />
        </div>
      ))}
    </div>
  );
};

export default RegularFieldsSection;
