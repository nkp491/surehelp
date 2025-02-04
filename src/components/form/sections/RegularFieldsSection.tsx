import { FormField } from "@/types/formTypes";
import DraggableFormField from "../../DraggableFormField";

interface RegularFieldsSectionProps {
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
}

const RegularFieldsSection = ({ fields, formData, setFormData, errors, submissionId }: RegularFieldsSectionProps) => {
  return (
    <div className="form-container">
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
  );
};

export default RegularFieldsSection;