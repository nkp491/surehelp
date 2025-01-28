import { FormField } from "@/types/formTypes";
import DraggableFormField from "../DraggableFormField";

interface FormSectionProps {
  title: string;
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
}

const FormSection = ({
  title,
  fields,
  formData,
  setFormData,
}: FormSectionProps) => {
  return (
    <div className="bg-white rounded-md shadow-sm overflow-hidden h-full">
      <div className="bg-[#00A3E0] text-white px-2 py-1 text-sm font-medium">
        {title}
      </div>
      <div className="p-2">
        <div className="space-y-2">
          {fields.map((field) => (
            <div key={field.id} className="form-field-container">
              <DraggableFormField
                id={field.id}
                fieldType={field.type}
                label={field.label}
                value={formData[field.id]}
                onChange={(value) =>
                  setFormData((prev: any) => ({ ...prev, [field.id]: value }))
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FormSection;