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

  const assessmentFields = fields.filter(field =>
    ['phone', 'email', 'address', 'notes', 'followUpNotes', 'coverageOptions',
     'emergencyContact', 'beneficiaries'].includes(field.id)
  );

  return (
    <div className="w-full px-1 py-2 space-y-2">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <FormSection
          title="Primary Health Assessment"
          fields={healthFields}
          formData={formData}
          setFormData={setFormData}
        />
        <FormSection
          title="Income Assessment"
          fields={incomeFields}
          formData={formData}
          setFormData={setFormData}
        />
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