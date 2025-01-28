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
    <div className="w-full overflow-y-auto px-4">
      <div 
        className={`relative w-full max-w-[1300px] min-h-[1300px] mx-auto rounded-lg overflow-hidden transition-all duration-200 ${
          isEditMode ? 'bg-grid edit-mode' : 'bg-white'
        }`}
        style={{
          boxShadow: isEditMode ? '0 1px 2px rgb(0 0 0 / 0.05)' : 'none',
          backgroundSize: '8px 8px'
        }}
        onClick={() => setSelectedField(null)}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {sections.map((section, sectionIndex) => (
            <FormSection
              key={section.title}
              title={section.title}
              fields={section.fields}
              sectionIndex={sectionIndex}
              formData={formData}
              setFormData={setFormData}
              fieldPositions={fieldPositions}
              selectedField={selectedField}
              setSelectedField={setSelectedField}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default DragDropArea;