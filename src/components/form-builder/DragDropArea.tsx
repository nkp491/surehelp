import { FormField } from "@/types/formTypes";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";
import FormSection from "./FormSection";
import { isHealthField, isIncomeField, isAgentField } from "@/utils/fieldCategories";

interface DragDropAreaProps {
  fields: FormField[];
  fieldPositions: Record<string, any>;
  formData: any;
  setFormData: (value: any) => void;
  selectedField: string | null;
  setSelectedField: (fieldId: string | null) => void;
}

const DragDropArea = ({
  fields,
  fieldPositions,
  formData,
  setFormData,
  selectedField,
  setSelectedField,
}: DragDropAreaProps) => {
  const { isEditMode } = useFormBuilder();
  const { showSpouse } = useSpouseVisibility();

  // Filter out spouse fields if spouse toggle is off
  const filterSpouseFields = (fields: FormField[]) => {
    return fields.filter(field => {
      const isSpouseField = field.id.toLowerCase().includes('spouse');
      return showSpouse ? true : !isSpouseField;
    });
  };

  // Filter and sort fields by category
  const healthFields = filterSpouseFields(fields.filter(field => isHealthField(field.id)));
  const incomeFields = filterSpouseFields(fields.filter(field => isIncomeField(field.id)));
  const agentFields = fields.filter(field => isAgentField(field.id));
  const assessmentFields = filterSpouseFields(fields.filter(field => 
    !isHealthField(field.id) && !isIncomeField(field.id) && !isAgentField(field.id)
  ));

  // Create sections with their fields
  const sections = [
    { title: "Primary Health Assessment", fields: healthFields },
    { title: "Income Assessment", fields: incomeFields },
    { title: "Household Income", fields: agentFields },
    { title: "Assessment Notes", fields: assessmentFields }
  ];
  
  return (
    <div className="w-full px-4 py-6 space-y-6">
      <div className="text-right">
        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
          + Add Family Member
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => (
          <FormSection
            key={section.title}
            title={section.title}
            fields={section.fields}
            sectionIndex={index}
            formData={formData}
            setFormData={setFormData}
            fieldPositions={fieldPositions}
            selectedField={selectedField}
            setSelectedField={setSelectedField}
          />
        ))}
      </div>
    </div>
  );
};

export default DragDropArea;