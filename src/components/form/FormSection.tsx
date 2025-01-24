import { useState } from "react";
import { FormField } from "@/types/formTypes";
import SectionHeader from "./SectionHeader";
import DragDropArea from "../form-builder/DragDropArea";
import FormFieldProperties from "../form-builder/FormFieldProperties";
import { useFieldPositions } from "../form-builder/useFieldPositions";

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
  onRemove,
}: FormSectionProps) => {
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const { fieldPositions, handleDragEnd, updateFieldProperties } = useFieldPositions({
    section,
    fields,
    selectedField
  });

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
      <SectionHeader section={section} onRemove={onRemove} />
      
      <DragDropArea
        fields={fields}
        fieldPositions={fieldPositions}
        formData={formData}
        setFormData={setFormData}
        selectedField={selectedField}
        setSelectedField={setSelectedField}
        onDragEnd={handleDragEnd}
      />

      <FormFieldProperties
        open={!!selectedField}
        onClose={() => setSelectedField(null)}
        selectedField={
          selectedField
            ? {
                id: selectedField,
                ...fieldPositions[selectedField],
              }
            : null
        }
        onUpdate={updateFieldProperties}
      />
    </div>
  );
};

export default FormSection;