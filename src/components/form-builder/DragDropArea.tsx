import { FormField } from "@/types/formTypes";
import DraggableField from "./DraggableField";
import { useFormBuilder } from "@/contexts/FormBuilderContext";
import { useSpouseVisibility } from "@/contexts/SpouseVisibilityContext";

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
  
  const calculateInitialPosition = (sectionIndex: number, fieldIndex: number) => {
    const GRID_SIZE = 8;
    const FIELD_WIDTH = 208;
    const FIELD_HEIGHT = 48;
    const SECTION_PADDING = 64; // Space for section headers
    
    // Calculate position with 2 columns per section
    const columnsPerRow = 2;
    const column = fieldIndex % columnsPerRow;
    const row = Math.floor(fieldIndex / columnsPerRow);
    
    const x = column * (FIELD_WIDTH + GRID_SIZE * 2) + GRID_SIZE * 2;
    const y = (row * (FIELD_HEIGHT + GRID_SIZE * 2) + GRID_SIZE * 2) + (sectionIndex * SECTION_PADDING);
    
    return { x, y };
  };

  // Helper function to check if a field belongs to a category
  const isHealthField = (fieldId: string) => {
    const healthFields = ['height', 'weight', 'tobaccoUse', 'dui', 'selectedConditions', 'medicalConditions', 
                         'hospitalizations', 'surgeries', 'prescriptionMedications', 'lastMedicalExam', 
                         'familyMedicalConditions', 'spouseHeight', 'spouseWeight', 'spouseTobaccoUse', 
                         'spouseDui', 'spouseSelectedConditions', 'spouseMedicalConditions'];
    return healthFields.some(field => fieldId.includes(field));
  };

  const isIncomeField = (fieldId: string) => {
    const incomeFields = ['employmentStatus', 'occupation', 'employmentIncome', 'selectedInvestments',
                         'socialSecurityIncome', 'pensionIncome', 'survivorshipIncome', 'totalIncome',
                         'householdExpenses', 'spouseEmploymentStatus', 'spouseOccupation', 
                         'spouseEmploymentIncome', 'spouseSelectedInvestments'];
    return incomeFields.some(field => fieldId.includes(field));
  };

  const isAgentField = (fieldId: string) => {
    const agentFields = ['sourcedFrom', 'leadType', 'premium', 'effectiveDate', 'draftDay',
                        'coverageAmount', 'accidental', 'carrierAndProduct', 'policyNumber'];
    return agentFields.some(field => fieldId.includes(field));
  };

  // Filter and sort fields by category
  const healthFields = fields.filter(field => isHealthField(field.id));
  const incomeFields = fields.filter(field => isIncomeField(field.id));
  const agentFields = fields.filter(field => isAgentField(field.id));
  const assessmentFields = fields.filter(field => 
    !isHealthField(field.id) && !isIncomeField(field.id) && !isAgentField(field.id)
  );

  // Filter out spouse fields if spouse toggle is off
  const filterSpouseFields = (fields: FormField[]) => {
    return fields.filter(field => {
      const isSpouseField = field.id.toLowerCase().includes('spouse');
      return showSpouse ? true : !isSpouseField;
    });
  };

  // Create sections with their fields
  const sections = [
    { title: "Health Assessment", fields: filterSpouseFields(healthFields) },
    { title: "Income Assessment", fields: filterSpouseFields(incomeFields) },
    { title: "Agent Use Only", fields: agentFields },
    { title: "Assessment Notes", fields: assessmentFields }
  ];
  
  return (
    <div className="w-full overflow-y-auto">
      <div 
        className={`relative w-[1300px] min-h-[1300px] mx-auto rounded-lg overflow-hidden transition-all duration-200 ${
          isEditMode ? 'bg-grid edit-mode' : 'bg-white'
        }`}
        style={{
          boxShadow: isEditMode ? '0 1px 2px rgb(0 0 0 / 0.05)' : 'none',
          backgroundSize: '8px 8px'
        }}
        onClick={() => setSelectedField(null)}
      >
        {sections.map((section, sectionIndex) => (
          <div key={section.title} className="relative">
            {isEditMode && (
              <h3 className="absolute text-sm font-medium text-gray-500 px-2 py-1 bg-white/80 rounded-sm shadow-sm" 
                  style={{ 
                    top: sectionIndex * 64, 
                    left: 8 
                  }}>
                {section.title}
              </h3>
            )}
            {section.fields.map((field, fieldIndex) => {
              const position = fieldPositions[field.id] || {};
              const initialPosition = calculateInitialPosition(sectionIndex, fieldIndex);
              
              return (
                <DraggableField
                  key={field.id}
                  id={field.id}
                  fieldType={field.type}
                  label={field.label}
                  value={formData[field.id]}
                  onChange={(value) =>
                    setFormData((prev: any) => ({ ...prev, [field.id]: value }))
                  }
                  width={position.width || "208px"}
                  height={position.height || "48px"}
                  alignment={position.alignment || "left"}
                  onSelect={() => setSelectedField(field.id)}
                  isSelected={selectedField === field.id}
                  style={{
                    transform: `translate(${position.x_position || initialPosition.x}px, ${position.y_position || initialPosition.y}px)`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DragDropArea;