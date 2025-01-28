import { FormField } from "@/types/formTypes";
import FormSection from "./FormSection";

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
  const healthFields = fields.filter(field => 
    ['name', 'dob', 'age', 'height', 'weight', 'tobaccoUse', 'dui', 'selectedConditions', 
     'medicalConditions', 'hospitalizations', 'surgeries', 'prescriptionMedications', 
     'lastMedicalExam', 'familyMedicalConditions'].includes(field.id)
  );

  const incomeFields = fields.filter(field => 
    ['employmentStatus', 'occupation', 'employmentIncome', 'selectedInvestments',
     'socialSecurityIncome', 'pensionIncome', 'survivorshipIncome', 'totalIncome',
     'householdExpenses'].includes(field.id)
  );

  const householdFields = fields.filter(field =>
    ['lifeInsuranceAmount', 'rentOrMortgage', 'remainingBalance', 'yearsLeft',
     'homeValue', 'equity', 'expenses'].includes(field.id)
  );

  const assessmentFields = fields.filter(field =>
    ['phone', 'email', 'address', 'notes', 'followUpNotes', 'coverageOptions',
     'emergencyContact', 'beneficiaries'].includes(field.id)
  );

  return (
    <div className="w-full h-[calc(100vh-12rem)] overflow-y-auto px-2 py-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <FormSection
          title="Primary Health Assessment"
          fields={healthFields}
          formData={formData}
          setFormData={setFormData}
        />
        <div className="space-y-3">
          <FormSection
            title="Income Assessment"
            fields={incomeFields}
            formData={formData}
            setFormData={setFormData}
          />
          <FormSection
            title="Household Income"
            fields={householdFields}
            formData={formData}
            setFormData={setFormData}
          />
        </div>
        <FormSection
          title="Assessment Notes"
          fields={assessmentFields}
          formData={formData}
          setFormData={setFormData}
        />
      </div>
    </div>
  );
};

export default DragDropArea;