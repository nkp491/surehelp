import { FormField } from "@/types/formTypes";
import DraggableFormField from "../DraggableFormField";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

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
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: `section-${section}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3"
    >
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-semibold text-gray-900">{section}</h2>
        <div
          {...attributes}
          {...listeners}
          className="cursor-move hover:text-primary"
        >
          <GripVertical className="h-5 w-5" />
        </div>
      </div>
      <div className="space-y-3">
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