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
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-[#3B82F6] text-white px-4 py-2 text-sm font-medium">
        {title}
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.id} className="w-full">
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