import { FormField } from "@/types/formTypes";
import DraggableField from "./DraggableField";

interface FormSectionProps {
  title: string;
  fields: FormField[];
  sectionIndex: number;
  formData: any;
  setFormData: (value: any) => void;
  fieldPositions: Record<string, any>;
  selectedField: string | null;
  setSelectedField: (fieldId: string | null) => void;
}

const FormSection = ({
  title,
  fields,
  sectionIndex,
  formData,
  setFormData,
  fieldPositions,
  selectedField,
  setSelectedField,
}: FormSectionProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="bg-[#3B82F6] text-white px-4 py-2 text-sm font-medium">
        {title}
      </div>
      <div className="p-4">
        <div className="space-y-4">
          {fields.map((field, fieldIndex) => {
            const position = fieldPositions[field.id] || {};
            
            return (
              <div key={field.id} className="w-full">
                <DraggableField
                  id={field.id}
                  fieldType={field.type}
                  label={field.label}
                  value={formData[field.id]}
                  onChange={(value) =>
                    setFormData((prev: any) => ({ ...prev, [field.id]: value }))
                  }
                  width={position.width || "100%"}
                  height={position.height || "auto"}
                  alignment={position.alignment || "left"}
                  onSelect={() => setSelectedField(field.id)}
                  isSelected={selectedField === field.id}
                  style={{
                    position: 'relative',
                    transform: 'none',
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default FormSection;