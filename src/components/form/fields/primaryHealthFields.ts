import { FormField } from "@/types/formTypes";

export const PRIMARY_HEALTH_FIELDS: FormField[] = [
  { id: "name", type: "text", label: "Primary Applicant Name", required: true },
  { id: "dob", type: "date", label: "Primary Date of Birth", required: true },
  { id: "age", type: "text", label: "Primary Age" },
  { id: "height", type: "height", label: "Primary Height", placeholder: "Enter primary height" },
  { id: "weight", type: "text", label: "Primary Weight", placeholder: "Enter primary weight" },
  { id: "tobaccoUse", type: "tobaccoUse", label: "Primary Tobacco Use" },
  { id: "dui", type: "select", label: "Primary DUI History", options: ["None", "Within 3 years", "Within 5 years", "Over 5 years"] },
  { id: "selectedConditions", type: "medicalConditions", label: "Primary Medical Conditions" },
  { id: "medicalConditions", type: "text", label: "Primary Other Medical Conditions", placeholder: "Enter any other medical conditions" },
  { id: "hospitalizations", type: "text", label: "Primary Hospitalizations", placeholder: "Enter any hospitalizations" },
  { id: "surgeries", type: "text", label: "Primary Surgeries", placeholder: "Enter any surgeries" },
  { id: "prescriptionMedications", type: "textarea", label: "Primary Prescription Medications", placeholder: "Enter prescription medications" },
  { id: "lastMedicalExam", type: "date", label: "Primary Last Medical Exam" },
  { id: "familyMedicalConditions", type: "textarea", label: "Primary Family Medical Conditions", placeholder: "Enter family medical conditions" },
];