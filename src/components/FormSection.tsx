import { FormField } from "@/types/formTypes";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import DraggableFormField from "../DraggableFormField";

interface FormSectionProps {
  section: string;
  fields: FormField[];
  formData: any;
  setFormData: (value: any) => void;
  errors: any;
  submissionId?: string;
  onRemove?: () => void;
}

const FormSection = ({ 
  section, 
  fields, 
  formData, 
  setFormData, 
  errors,
  submissionId,
  onRemove
}: FormSectionProps) => {
  // Function to check if a field should be rendered in the special row
  const isSpecialField = (fieldId: string) => {
    return ['height', 'weight', 'tobaccoUse'].includes(fieldId);
  };

  // Separate special fields from regular fields
  const specialFields = fields.filter(field => isSpecialField(field.id));
  const regularFields = fields.filter(field => !isSpecialField(field.id));

  // Split remaining fields into two columns
  const midPoint = Math.ceil(regularFields.length / 2);
  const leftColumnFields = regularFields.slice(0, midPoint);
  const rightColumnFields = regularFields.slice(midPoint);

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold text-gray-900">{section}</h2>
        {onRemove && (
          <Button
            onClick={onRemove}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Special row for height, weight, and tobacco use if this is the Primary Health Assessment section */}
      {section === "Primary Health Assessment" && specialFields.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-4">
          {specialFields.map((field) => (
            <div key={field.id} className="w-full">
              <DraggableFormField
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
            </div>
          ))}
        </div>
      )}

      {/* Regular two-column layout for remaining fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
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
        {/* Right Column */}
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
    </div>
  );
};

export default FormSection;