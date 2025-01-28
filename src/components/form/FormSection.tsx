import { FormField } from "@/types/formTypes";
import SectionHeader from "./SectionHeader";
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
  if (section === "Primary Health Assessment") {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="bg-[#3B82F6] text-white px-4 py-2 rounded-t-lg">
          <h2 className="text-lg font-medium">{section}</h2>
        </div>
        <div className="p-6 space-y-6">
          {/* Full Name */}
          <div className="w-full">
            <DraggableFormField
              id="name"
              fieldType="text"
              label="Full Name"
              value={formData.name}
              onChange={(value) => setFormData({ ...formData, name: value })}
              required={true}
            />
          </div>

          {/* Date of Birth, Age, Height, Weight Row */}
          <div className="grid grid-cols-4 gap-4">
            <DraggableFormField
              id="dob"
              fieldType="text"
              label="Date of Birth"
              value={formData.dob}
              onChange={(value) => setFormData({ ...formData, dob: value })}
              placeholder="MM/DD/YYY"
              required={true}
            />
            <DraggableFormField
              id="age"
              fieldType="text"
              label="Age"
              value={formData.age}
              onChange={(value) => setFormData({ ...formData, age: value })}
            />
            <DraggableFormField
              id="height"
              fieldType="height"
              label="Height"
              value={formData.height}
              onChange={(value) => setFormData({ ...formData, height: value })}
            />
            <DraggableFormField
              id="weight"
              fieldType="text"
              label="Weight"
              value={formData.weight}
              onChange={(value) => setFormData({ ...formData, weight: value })}
            />
          </div>

          {/* Tobacco Use and DUI History Row */}
          <div className="grid grid-cols-2 gap-4">
            <DraggableFormField
              id="tobaccoUse"
              fieldType="tobaccoUse"
              label="Tobacco Use"
              value={formData.tobaccoUse}
              onChange={(value) => setFormData({ ...formData, tobaccoUse: value })}
            />
            <DraggableFormField
              id="dui"
              fieldType="select"
              label="DUI History"
              value={formData.dui}
              onChange={(value) => setFormData({ ...formData, dui: value })}
            />
          </div>

          {/* Medical Conditions */}
          <div className="w-full">
            <DraggableFormField
              id="selectedConditions"
              fieldType="medicalConditions"
              label="Medical Conditions"
              value={formData.selectedConditions}
              onChange={(value) => setFormData({ ...formData, selectedConditions: value })}
            />
          </div>

          {/* Hospitalizations */}
          <div className="w-full">
            <DraggableFormField
              id="hospitalizations"
              fieldType="textarea"
              label="Hospitalizations"
              value={formData.hospitalizations}
              onChange={(value) => setFormData({ ...formData, hospitalizations: value })}
            />
          </div>

          {/* Surgeries */}
          <div className="w-full">
            <DraggableFormField
              id="surgeries"
              fieldType="textarea"
              label="Surgeries"
              value={formData.surgeries}
              onChange={(value) => setFormData({ ...formData, surgeries: value })}
            />
          </div>

          {/* Prescription Medications */}
          <div className="w-full">
            <DraggableFormField
              id="prescriptionMedications"
              fieldType="textarea"
              label="Prescription Medications"
              value={formData.prescriptionMedications}
              onChange={(value) => setFormData({ ...formData, prescriptionMedications: value })}
            />
          </div>

          {/* Last Medical Exam */}
          <div className="w-full">
            <DraggableFormField
              id="lastMedicalExam"
              fieldType="date"
              label="Last Medical Exam"
              value={formData.lastMedicalExam}
              onChange={(value) => setFormData({ ...formData, lastMedicalExam: value })}
            />
          </div>

          {/* Family Medical Conditions */}
          <div className="w-full">
            <DraggableFormField
              id="familyMedicalConditions"
              fieldType="textarea"
              label="Family Medical Conditions"
              value={formData.familyMedicalConditions}
              onChange={(value) => setFormData({ ...formData, familyMedicalConditions: value })}
            />
          </div>
        </div>
      </div>
    );
  }

  // Return default layout for other sections
  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3">
      <SectionHeader section={section} onRemove={onRemove} />
      <div className="grid grid-cols-2 gap-4">
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
            error={errors[field.id]}
            submissionId={submissionId}
          />
        ))}
      </div>
    </div>
  );
};

export default FormSection;