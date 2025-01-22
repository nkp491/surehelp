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
  const isAssessmentNotes = section === "Assessment Notes";
  const leftColumnFields = isAssessmentNotes ? fields.slice(0, 4) : [];
  const rightColumnFields = isAssessmentNotes ? fields.slice(4) : [];

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
      {isAssessmentNotes ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Left Column - Contact Information */}
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
          {/* Right Column - Notes */}
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
      ) : (
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
      )}
    </div>
  );
};

export default FormSection;