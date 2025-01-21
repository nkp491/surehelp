import { FormField } from "@/types/formTypes";

export const SPOUSE_HEALTH_FIELDS: FormField[] = [
  { id: "spouseName", type: "text", label: "Spouse Name" },
  { id: "spouseDob", type: "date", label: "Spouse Date of Birth" },
  { id: "spouseAge", type: "text", label: "Spouse Age" },
  { id: "spouseHeight", type: "height", label: "Spouse Height", placeholder: "Enter spouse height" },
  { id: "spouseWeight", type: "text", label: "Spouse Weight", placeholder: "Enter spouse weight" },
  { id: "spouseTobaccoUse", type: "tobaccoUse", label: "Spouse Tobacco Use" },
  { id: "spouseDui", type: "select", label: "Spouse DUI History", options: ["None", "Within 3 years", "Within 5 years", "Over 5 years"] },
  { id: "spouseSelectedConditions", type: "medicalConditions", label: "Spouse Medical Conditions" },
  { id: "spouseMedicalConditions", type: "text", label: "Spouse Other Medical Conditions", placeholder: "Enter any other medical conditions" },
  { id: "spouseHospitalizations", type: "text", label: "Spouse Hospitalizations", placeholder: "Enter any hospitalizations" },
  { id: "spouseSurgeries", type: "text", label: "Spouse Surgeries", placeholder: "Enter any surgeries" },
  { id: "spousePrescriptionMedications", type: "textarea", label: "Spouse Prescription Medications", placeholder: "Enter prescription medications" },
  { id: "spouseLastMedicalExam", type: "date", label: "Spouse Last Medical Exam" },
  { id: "spouseFamilyMedicalConditions", type: "textarea", label: "Spouse Family Medical Conditions", placeholder: "Enter family medical conditions" },
];