import { FormField } from "@/types/formTypes";
import DraggableFormField from "../DraggableFormField";

interface TwoColumnLayoutProps {
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
}

const TwoColumnLayout = ({ fields, formData, setFormData, errors, submissionId }: TwoColumnLayoutProps) => {
  // Calculate optimal column distribution
  const midPoint = Math.ceil(fields.length / 2);
  const leftColumnFields = fields.slice(0, midPoint);
  const rightColumnFields = fields.slice(midPoint);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <div className="space-y-3">
        {leftColumnFields.map((field) => (
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
      <div className="space-y-3">
        {rightColumnFields.map((field) => (
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

export default TwoColumnLayout;