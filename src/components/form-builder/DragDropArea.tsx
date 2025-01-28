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
  // Filter and sort fields by category
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
    <div className="w-full px-4 py-6 space-y-6">
      <div className="text-right mb-4">
        <button className="text-[#3B82F6] hover:text-blue-700 text-sm font-medium">
          + Add Family Member
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <FormSection
          title="Primary Health Assessment"
          fields={healthFields}
          formData={formData}
          setFormData={setFormData}
        />
        <div className="space-y-6">
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
      <div className="mt-8 text-center">
        <p className="text-gray-700 mb-4">Submit As:</p>
        <div className="flex justify-center gap-4">
          <button className="px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600">
            Protected
          </button>
          <button className="px-6 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600">
            Follow-Up
          </button>
          <button className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600">
            Declined
          </button>
        </div>
      </div>
    </div>
  );
};

export default DragDropArea;