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
  
  const calculateInitialPosition = (index: number) => {
    const GRID_SIZE = 8;
    const FIELD_WIDTH = 208;
    const FIELD_HEIGHT = 48;
    const GRID_WIDTH = 1300;
    const GRID_HEIGHT = 1300;
    
    const columns = Math.floor((GRID_WIDTH - GRID_SIZE) / (FIELD_WIDTH + GRID_SIZE));
    const row = Math.floor(index / columns);
    const col = index % columns;
    
    const x = col * (FIELD_WIDTH + GRID_SIZE) + GRID_SIZE;
    const y = row * (FIELD_HEIGHT + GRID_SIZE) + GRID_SIZE;
    
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

  // Combine all fields in the desired order
  const organizedFields = [
    ...healthFields,
    ...incomeFields,
    ...agentFields,
    ...assessmentFields
  ];

  // Filter out spouse fields if spouse toggle is off
  const visibleFields = organizedFields.filter(field => {
    const isSpouseField = field.id.toLowerCase().includes('spouse');
    return showSpouse ? true : !isSpouseField;
  });
  
  return (
    <div className="w-full overflow-y-auto">
      <div 
        className={`relative w-[1300px] h-[1300px] mx-auto rounded-lg overflow-hidden transition-all duration-200 ${
          isEditMode ? 'bg-grid edit-mode' : 'bg-white'
        }`}
        style={{
          boxShadow: isEditMode ? '0 1px 2px rgb(0 0 0 / 0.05)' : 'none',
          backgroundSize: '8px 8px'
        }}
        onClick={() => setSelectedField(null)}
      >
        {visibleFields.map((field, index) => {
          const position = fieldPositions[field.id] || {};
          const initialPosition = calculateInitialPosition(index);
          
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
    </div>
  );
};

export default DragDropArea;